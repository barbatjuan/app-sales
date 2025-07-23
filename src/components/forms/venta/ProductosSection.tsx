import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductoSelectionItem } from "./ProductoSelectionItem";
import { Producto, ProductoCategoria } from "@/types";
import { UnidadTipo } from "./UnidadSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductosSectionProps {
  items: { productoId: string; cantidad: string; unidadTipo: UnidadTipo; precioUnitario?: string; subtotal?: string }[];
  productos: Producto[];
  setItems: (items: { productoId: string; cantidad: string; unidadTipo: UnidadTipo; precioUnitario?: string; subtotal?: string }[]) => void;
  updateFormItems: (items: { productoId: string; cantidad: string; unidadTipo: UnidadTipo; precioUnitario?: string; subtotal?: string }[], index?: number, field?: string) => void;
  setTotal: (total: number) => void;
  errors?: {
    items?: {
      message?: string;
    } & {
      [key: number]: {
        productoId?: { message?: string };
        cantidad?: { message?: string };
        precioUnitario?: { message?: string };
        subtotal?: { message?: string };
      };
    };
  };
}

export function ProductosSection({ 
  items, 
  productos, 
  setItems, 
  updateFormItems,
  errors,
  setTotal
}: ProductosSectionProps) {
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>(productos);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [internalTotal, setInternalTotal] = useState(0);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };
  
  const categoriasFijas: ProductoCategoria[] = [
    'milanesas', 
    'pizzas', 
    'salsas', 
    'empanadas', 
    'sorrentinos', 
    'lasañas', 
    'canelones', 
    'tartas', 
    'pastel de papa'
  ];

  useEffect(() => {
    if (selectedCategoria) {
      const filtered = productos.filter(p => p.categoria === selectedCategoria);
      setFilteredProductos(filtered);
    } else {
      setFilteredProductos(productos);
    }
  }, [selectedCategoria, productos]);

  // Factores de conversión para unidades
  const factorConversion = {
    "unidad": 1,
    "docena": 12,
    "media_docena": 6,
    "kilo": 1,
    "medio_kilo": 0.5
  };

  useEffect(() => {
    const calculateTotal = () => {
      const newTotal = items.reduce((acc, item) => {
        if (item.productoId) {
          // Usar el subtotal si está disponible, sino calcular automáticamente
          if (item.subtotal) {
            return acc + parseFloat(item.subtotal);
          } else {
            // Fallback: calcular si no hay subtotal
            const producto = productos.find(p => p.id === item.productoId);
            if (producto) {
              const cantidad = parseFloat(item.cantidad || '0');
              const precioUnitario = parseFloat(item.precioUnitario || producto.precio.toString());
              return acc + (precioUnitario * cantidad);
            }
          }
        }
        return acc;
      }, 0);
      setInternalTotal(newTotal);
      setTotal(newTotal);
    };
    calculateTotal();
  }, [items, productos, setTotal]);

  const addItem = () => {
    const newItems = [...items, { productoId: "", cantidad: "1", unidadTipo: "unidad" as UnidadTipo, precioUnitario: "", subtotal: "" }];
    setItems(newItems);
    updateFormItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      updateFormItems(newItems);
    }
  };

  const updateItem = (index: number, field: "productoId" | "cantidad" | "unidadTipo" | "precioUnitario" | "subtotal", value: string | UnidadTipo) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
    updateFormItems(newItems, index, field);
  };

  return (
    <div className="space-y-6">
      {/* Header compacto */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {items.filter(item => item.productoId).length} producto(s)
        </div>
        <Select onValueChange={(value) => setSelectedCategoria(value === "todos" ? null : value)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filtrar categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            {categoriasFijas.map((categoria) => (
              <SelectItem key={categoria} value={categoria}>
                {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredProductos.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
          <div className="mb-2">📦</div>
          <div className="font-medium mb-1">
            No hay productos disponibles en inventario
            {selectedCategoria ? ` para la categoría "${selectedCategoria}"` : ""}
          </div>
          <p className="text-xs">
            <a href="/productos" className="text-primary underline hover:text-primary/80">
              Agregar productos al inventario
            </a>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Encabezados de columna */}
          <div className="grid grid-cols-12 gap-3 px-3 py-2 text-xs font-medium text-muted-foreground border-b">
            <div className="col-span-4">Producto</div>
            <div className="col-span-2">Cantidad</div>
            <div className="col-span-2">Precio Unit.</div>
            <div className="col-span-2">Unidad</div>
            <div className="col-span-2 text-right">Subtotal</div>
          </div>
          
          {/* Lista de productos */}
          <div className="space-y-2">
            {items.map((item, index) => (
              <ProductoSelectionItem
                key={index}
                item={item}
                index={index}
                productos={filteredProductos}
                updateItem={updateItem}
                removeItem={removeItem}
                disableRemove={items.length === 1}
                setTotal={setTotal}
                errors={errors?.items?.[index]}
              />
            ))}
          </div>
        </div>
      )}
      
      {errors?.items?.message && (
        <div className="p-3 border border-destructive/20 bg-destructive/5 rounded-lg">
          <p className="text-sm text-destructive font-medium">
            {errors.items.message}
          </p>
        </div>
      )}
      
      {/* Botón agregar producto */}
      <div className="flex justify-center mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          className="flex items-center gap-2 h-9 px-4 text-sm"
        >
          <Plus className="h-3 w-3" />
          Agregar Producto
        </Button>
      </div>

      {/* Total compacto */}
      <div className="mt-4 pt-3 border-t">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {items.filter(item => item.productoId).length} producto(s) • {items.reduce((acc, item) => acc + parseFloat(item.cantidad || '0'), 0)} unidades
          </div>
          <div className="text-xl font-bold text-primary">
            {formatCurrency(internalTotal)}
          </div>
        </div>
      </div>
    </div>
  );
}
