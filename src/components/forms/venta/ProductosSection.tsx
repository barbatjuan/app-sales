
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductoSelectionItem } from "./ProductoSelectionItem";
import { Producto, ProductoCategoria } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductosSectionProps {
  items: { productoId: string; cantidad: string }[];
  productos: Producto[];
  setItems: (items: { productoId: string; cantidad: string }[]) => void;
  updateFormItems: (items: { productoId: string; cantidad: string }[]) => void;
  errors?: {
    items?: {
      message?: string;
      [index: number]: {
        productoId?: { message?: string };
        cantidad?: { message?: string };
      };
    };
  };
}

export function ProductosSection({ 
  items, 
  productos, 
  setItems, 
  updateFormItems,
  errors
}: ProductosSectionProps) {
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>(productos);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  
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

  const addItem = () => {
    const newItems = [...items, { productoId: "", cantidad: "1" }];
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

  const updateItem = (index: number, field: "productoId" | "cantidad", value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
    updateFormItems(newItems, index, field);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Productos</h3>
        <div className="flex gap-2">
          <Select onValueChange={(value) => setSelectedCategoria(value === "todos" ? null : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las categorías</SelectItem>
              {categoriasFijas.map((categoria) => (
                <SelectItem key={categoria} value={categoria}>
                  {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" /> Agregar
          </Button>
        </div>
      </div>
      
      {filteredProductos.length === 0 ? (
        <div className="text-center py-4 text-sm text-muted-foreground border rounded-md">
          No hay productos disponibles en inventario
          {selectedCategoria ? ` para la categoría "${selectedCategoria}"` : ""}.
          <p className="mt-1">
            <a href="/productos" className="text-primary underline">
              Agregar productos al inventario
            </a>
          </p>
        </div>
      ) : (
        items.map((item, index) => (
          <ProductoSelectionItem
            key={index}
            item={item}
            index={index}
            productos={productos}
            updateItem={updateItem}
            removeItem={removeItem}
            disableRemove={items.length <= 1}
            errors={errors?.items?.[index]}
          />
        ))
      )}
      {errors?.items?.message && (
        <p className="text-xs text-destructive">
          {errors.items.message}
        </p>
      )}
    </div>
  );
}
