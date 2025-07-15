
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductoMenosVendido } from "@/types";
import { toast } from "sonner";

const LeastSellingProducts: React.FC = () => {
  const [productosMenosVendidos, setProductosMenosVendidos] = useState<ProductoMenosVendido[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeastSoldProducts();
  }, []);

  const fetchLeastSoldProducts = async () => {
    try {
      setIsLoading(true);

      // Primero obtenemos el company_id del usuario actual
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No hay sesión activa");
        return;
      }
      
      // Obtenemos el company_id desde el perfil del usuario
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', session.user.id)
        .single();
        
      if (profileError || !profileData) {
        console.error("Error al obtener el perfil o company_id:", profileError);
        throw new Error("No se pudo obtener el company_id del usuario");
        return;
      }
      
      const userCompanyId = profileData.company_id;
      console.log("Company ID del usuario en LeastSellingProducts:", userCompanyId);
      
      // Get all products filtered by company_id
      const { data: productos, error: productosError } = await supabase
        .from('productos')
        .select('id, nombre')
        .eq('company_id', userCompanyId) // Filtrar por company_id
        .eq('estado', 'activo');
      
      if (productosError) throw productosError;
      
      // Get all sale items, joining with ventas table to filter by company_id
      const { data: ventaItems, error: ventaItemsError } = await supabase
        .from('venta_items')
        .select('producto_id, producto_nombre, cantidad, venta_id, ventas!inner(company_id)')
        .eq('ventas.company_id', userCompanyId);
        
      if (ventaItemsError) throw ventaItemsError;
      
      if (productos && ventaItems) {
        // Create a map of product sales
        const ventasPorProducto: Record<string, { 
          id: string; 
          nombre: string; 
          cantidadVendida: number;
        }> = {};
        
        // Initialize all products with 0 sales
        productos.forEach(producto => {
          ventasPorProducto[producto.id] = {
            id: producto.id,
            nombre: producto.nombre,
            cantidadVendida: 0
          };
        });
        
        // Update with actual sales data
        ventaItems.forEach(item => {
          if (item.producto_id && ventasPorProducto[item.producto_id]) {
            ventasPorProducto[item.producto_id].cantidadVendida += item.cantidad;
          }
        });
        
        // Convert to array and sort by quantity (ascending)
        const sortedProductos = Object.values(ventasPorProducto)
          .sort((a, b) => a.cantidadVendida - b.cantidadVendida);
        
        // Take bottom 5 products
        const bottom5 = sortedProductos.slice(0, 5);
        
        // Calculate total quantity for percentage
        const totalVendido = Object.values(ventasPorProducto)
          .reduce((sum, product) => sum + product.cantidadVendida, 0);
        
        // Set colors
        const colors = ['#EF4444', '#F97316', '#F59E0B', '#A3E635', '#10B981'];
        
        // Format data
        const formattedProducts: ProductoMenosVendido[] = bottom5.map((product, index) => ({
          id: product.id,
          nombre: product.nombre,
          cantidadVendida: product.cantidadVendida,
          porcentaje: totalVendido ? Math.round((product.cantidadVendida / totalVendido) * 100) : 0,
          color: colors[index]
        }));
        
        setProductosMenosVendidos(formattedProducts);
      }
    } catch (error) {
      console.error("Error fetching least sold products:", error);
      toast.error("Error al cargar los productos menos vendidos");
    } finally {
      setIsLoading(false);
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground p-2 rounded-md shadow-md border border-border text-sm">
          <p className="font-medium">{label}</p>
          <p className="text-muted-foreground">Vendidos: {payload[0].value} unidades</p>
        </div>
      );
    }
    return null;
  };

  // Modified data for chart display
  const chartData = productosMenosVendidos.map(producto => ({
    nombre: producto.nombre.length > 12 ? `${producto.nombre.substring(0, 12)}...` : producto.nombre,
    cantidadVendida: producto.cantidadVendida,
    color: producto.color
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-destructive" />
          Productos Menos Vendidos
        </CardTitle>
        <CardDescription>Productos con menor rendimiento de ventas</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : productosMenosVendidos.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis 
                  dataKey="nombre" 
                  type="category" 
                  width={100} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="cantidadVendida" 
                  name="Cantidad vendida"
                  barSize={20}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex justify-center items-center h-[300px] text-muted-foreground">
            No hay datos de ventas suficientes para mostrar estadísticas
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeastSellingProducts;
