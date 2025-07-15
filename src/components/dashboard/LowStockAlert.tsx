
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductoBajoStock } from "@/types";
import { toast } from "sonner";
import StockAlertItem from "@/components/ui/stock-alert-item";

const LowStockAlert: React.FC = () => {
  const [productosBajoStock, setProductosBajoStock] = useState<ProductoBajoStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch low stock products
      const { data: productosData, error: productosError } = await supabase
        .from('productos')
        .select('id, nombre, stock')
        .lt('stock', 6)
        .eq('estado', 'activo')
        .order('stock', { ascending: true })
        .limit(6);
          
      if (productosError) throw productosError;
      
      if (productosData) {
        setProductosBajoStock(productosData);
      }
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      toast.error('Error al cargar los productos con bajo stock');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Productos con Bajo Stock
        </CardTitle>
        <CardDescription>Inventario que requiere reposición inmediata</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {!isLoading && productosBajoStock.length > 0 ? (
            productosBajoStock.map((producto) => (
              <StockAlertItem
                key={producto.id}
                name={producto.nombre}
                stock={producto.stock}
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-4 text-muted-foreground">
              {isLoading ? 
                "Cargando productos..." : 
                "No hay productos con bajo stock actualmente."
              }
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LowStockAlert;
