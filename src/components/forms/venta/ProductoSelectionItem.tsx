import React, { useRef, useState, useEffect } from "react";
import { Search, X, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Producto } from "@/types";
import { UnidadSelector, UnidadTipo } from "./UnidadSelector";
import { useMoneda } from "@/hooks/useMoneda";

interface Item {
  productoId: string;
  cantidad: string;
  unidadTipo: UnidadTipo;
  precioUnitario?: string;
  subtotal?: string;
}

interface ProductoSelectionItemProps {
  item: Item;
  index: number;
  productos: Producto[];
  updateItem: (index: number, field: "productoId" | "cantidad" | "unidadTipo" | "precioUnitario" | "subtotal", value: string | UnidadTipo) => void;
  removeItem: (index: number) => void;
  disableRemove: boolean;
  setTotal: (total: number) => void;
  errors?: {
    productoId?: { message?: string };
    cantidad?: { message?: string };
    precioUnitario?: { message?: string };
  };
}

export function ProductoSelectionItem({
  item,
  index,
  productos,
  updateItem,
  removeItem,
  disableRemove,
  errors,
  setTotal
}: ProductoSelectionItemProps) {
  const [productoSearch, setProductoSearch] = useState("");
  const [showProductoResults, setShowProductoResults] = useState(false);
  const productoSearchRef = useRef<HTMLDivElement>(null);
  
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>(productos);
  
  const { formatCurrency, moneda } = useMoneda();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setProductoSearch(searchValue);
    
    if (searchValue.trim() === '') {
      // If search is empty, show all products
      setFilteredProductos(productos);
      setShowProductoResults(false);
    } else {
      // Filter products based on search term
      const searchTerm = searchValue.toLowerCase().trim();
      const filtered = productos.filter(
        (producto) => producto.nombre.toLowerCase().includes(searchTerm)
      );
      setFilteredProductos(filtered);
      setShowProductoResults(true);
    }
  };

  const handleSelectProducto = (producto: Producto) => {
    updateItem(index, "productoId", producto.id);
    // Establecer el precio según la unidad seleccionada
    const precioSegunUnidad = getPrecioSegunUnidad(producto, item.unidadTipo);
    updateItem(index, "precioUnitario", precioSegunUnidad.toString());
    setProductoSearch("");
    setShowProductoResults(false);
  };

  // Función para obtener el precio correcto según la unidad
  const getPrecioSegunUnidad = (producto: Producto, unidad: UnidadTipo): number => {
    switch (unidad) {
      case "unidad":
        return producto.precio_unidad || producto.precio;
      case "media_docena":
        return producto.precio_media_docena || (producto.precio * 6);
      case "docena":
        return producto.precio_docena || (producto.precio * 12);
      case "kilo":
      case "medio_kilo":
      default:
        return producto.precio;
    }
  };

  // Manejar cambio de unidad y actualizar precio automáticamente
  const handleUnidadChange = (nuevaUnidad: UnidadTipo) => {
    updateItem(index, "unidadTipo", nuevaUnidad);
    
    // Si hay un producto seleccionado, actualizar el precio según la nueva unidad
    if (item.productoId) {
      const producto = productos.find(p => p.id === item.productoId);
      if (producto) {
        const nuevoPrecio = getPrecioSegunUnidad(producto, nuevaUnidad);
        updateItem(index, "precioUnitario", nuevoPrecio.toString());
      }
    }
  };

  // Calcular subtotal automáticamente solo cuando está vacío
  useEffect(() => {
    if (item.precioUnitario && item.cantidad && !item.subtotal) {
      const precio = parseFloat(item.precioUnitario || '0');
      const cantidad = parseFloat(item.cantidad || '0');
      const nuevoSubtotal = (precio * cantidad).toFixed(2);
      updateItem(index, "subtotal", nuevoSubtotal);
    }
  }, [item.precioUnitario, item.cantidad, item.subtotal, index, updateItem]);

  // Get currency symbol for input fields
  const getCurrencySymbol = () => {
    // Mostrar símbolo dólar para USD y UYU
    return (moneda === 'USD' || moneda === 'UYU') ? '$' : moneda;
  };

  return (
    <div className="border rounded-md p-3 bg-card">
      {item.productoId ? (
        // Línea compacta con producto seleccionado
        <div className="grid grid-cols-12 gap-3 items-center">
          {/* Producto - 4 columnas */}
          <div className="col-span-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">
                  {productos.find(p => p.id === item.productoId)?.nombre}
                </div>
                <div className="text-xs text-muted-foreground">
                  Stock: {productos.find(p => p.id === item.productoId)?.stock}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  updateItem(index, "productoId", "");
                  updateItem(index, "precioUnitario", "");
                  setProductoSearch("");
                }}
                className="text-muted-foreground hover:text-foreground h-6 w-6 p-0 ml-2 flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Cantidad - 2 columnas */}
          <div className="col-span-2">
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={item.cantidad}
              onChange={(e) => updateItem(index, "cantidad", e.target.value)}
              className="h-9 text-sm"
              placeholder="1"
            />
          </div>

          {/* Precio Unitario - 2 columnas */}
          <div className="col-span-2">
            <div className="relative">
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">{getCurrencySymbol()}</span>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={item.precioUnitario || (productos.find(p => p.id === item.productoId)?.precio.toString() || '')}
                onChange={(e) => updateItem(index, "precioUnitario", e.target.value)}
                className="h-9 pl-6 text-sm"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Unidad - 2 columnas */}
          <div className="col-span-2">
            <UnidadSelector 
              unidadSeleccionada={item.unidadTipo} 
              onChange={handleUnidadChange}
              categoria={productos.find(p => p.id === item.productoId)?.categoria || null}
            />
          </div>

          {/* Subtotal - 2 columnas */}
          <div className="col-span-2">
            <div className="relative">
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">{getCurrencySymbol()}</span>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={item.subtotal || '0.00'}
                onChange={(e) => updateItem(index, "subtotal", e.target.value)}
                className="h-9 pl-6 text-sm text-right font-semibold"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      ) : (
        // Buscador de producto
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar producto..."
              value={productoSearch}
              onChange={handleSearchChange}
              onFocus={() => setShowProductoResults(true)}
              className="pl-10 h-9"
            />
            {!disableRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-destructive h-6 w-6 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          {showProductoResults && productoSearch && (
            <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
              {filteredProductos.length > 0 ? (
                filteredProductos.map((producto) => (
                  <button
                    key={producto.id}
                    type="button"
                    onClick={() => handleSelectProducto(producto)}
                    className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground border-b last:border-b-0 focus:bg-accent focus:text-accent-foreground focus:outline-none"
                  >
                    <div className="font-medium text-sm">{producto.nombre}</div>
                    <div className="text-xs text-muted-foreground">
                      {producto.categoria} • Stock: {producto.stock} • {formatCurrency(producto.precio)}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No se encontraron productos
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Errores */}
      {(errors?.productoId || errors?.cantidad || errors?.precioUnitario) && (
        <div className="mt-2 space-y-1">
          {errors?.productoId && (
            <p className="text-xs text-destructive">{errors.productoId.message}</p>
          )}
          {errors?.cantidad && (
            <p className="text-xs text-destructive">{errors.cantidad.message}</p>
          )}
          {errors?.precioUnitario && (
            <p className="text-xs text-destructive">{errors.precioUnitario.message}</p>
          )}
        </div>
      )}
    </div>
  );
}
