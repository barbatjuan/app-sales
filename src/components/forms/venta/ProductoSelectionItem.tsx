
import React, { useRef, useState } from "react";
import { Search, X, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Producto } from "@/types";

interface ProductoSelectionItemProps {
  item: { productoId: string; cantidad: string };
  index: number;
  productos: Producto[];
  updateItem: (index: number, field: "productoId" | "cantidad", value: string) => void;
  removeItem: (index: number) => void;
  disableRemove: boolean;
  errors?: {
    productoId?: { message?: string };
    cantidad?: { message?: string };
  };
}

export function ProductoSelectionItem({
  item,
  index,
  productos,
  updateItem,
  removeItem,
  disableRemove,
  errors
}: ProductoSelectionItemProps) {
  const [productoSearch, setProductoSearch] = useState("");
  const [showProductoResults, setShowProductoResults] = useState(false);
  const productoSearchRef = useRef<HTMLDivElement>(null);
  
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>(productos);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setProductoSearch(searchValue);
    
    if (searchValue) {
      const filtered = productos.filter(
        (producto) => producto.nombre.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredProductos(filtered);
      setShowProductoResults(true);
    } else {
      setFilteredProductos(productos);
      setShowProductoResults(false);
    }
  };

  const handleSelectProducto = (producto: Producto) => {
    updateItem(index, "productoId", producto.id);
    setProductoSearch("");
    setShowProductoResults(false);
  };

  const formatCurrency = (amount: number) => {
    return `$ ${amount.toLocaleString('es-UY')}`;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <div className="relative" ref={productoSearchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#55F9E3]" />
            <input
              className="pl-9 h-12 w-full rounded-lg border border-[#55F9E3] bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55F9E3] focus-visible:ring-offset-2 transition-all shadow-sm placeholder:text-muted-foreground"
              placeholder="Buscar producto..."
              value={productoSearch}
              onChange={handleSearchChange}
              onFocus={() => setShowProductoResults(true)}
              onClick={() => setShowProductoResults(true)}
              autoComplete="off"
            />
          </div>
          {showProductoResults && (
            <div className="absolute left-0 top-full w-full z-50 overflow-auto rounded-lg border border-[#55F9E3] bg-background p-1 shadow-2xl animate-fade-in max-h-80">
              {filteredProductos.length > 0 ? (
                filteredProductos.map((producto, idx) => (
                  <div
                    key={producto.id}
                    className="cursor-pointer rounded-md px-3 py-3 text-base hover:bg-[#55F9E3]/10 hover:text-[#55F9E3] transition-colors"
                    onClick={() => handleSelectProducto(producto)}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSelectProducto(producto); }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{producto.nombre}</span>
                      <span className="text-muted-foreground">{formatCurrency(producto.precio)}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      {producto.categoria && (
                        <Badge variant="outline" className="text-xs mr-2">
                          {producto.categoria}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">Stock: {producto.stock}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground text-center select-none">
                  No se encontraron productos
                </div>
              )}
            </div>
          )}
        </div>
        
        {item.productoId && (
          <div className="flex items-center mt-1 text-sm">
            <span className="text-foreground">
              {productos.find(p => p.id === item.productoId)?.nombre || "Producto seleccionado"}
            </span>
          </div>
        )}
        
        <input type="hidden" value={item.productoId} onChange={(e) => updateItem(index, "productoId", e.target.value)} />
        
        {errors?.productoId && (
          <p className="text-xs text-destructive mt-1">
            {errors.productoId.message}
          </p>
        )}
      </div>
      
      <div className="w-20">
        <Input
          type="number"
          min="1"
          value={item.cantidad}
          onChange={(e) => updateItem(index, "cantidad", e.target.value)}
        />
        {errors?.cantidad && (
          <p className="text-xs text-destructive mt-1">
            {errors.cantidad.message}
          </p>
        )}
      </div>
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => removeItem(index)}
        disabled={disableRemove}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
