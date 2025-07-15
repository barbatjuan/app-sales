
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PieChart as PieChartIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductoMasVendido } from "@/types";
import { toast } from "sonner";

const TopSellingProducts: React.FC = () => {
  const [productosMasVendidos, setProductosMasVendidos] = useState<ProductoMasVendido[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMostSoldProducts();
  }, []);

  const fetchMostSoldProducts = async () => {
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
      console.log("Company ID del usuario en TopSellingProducts:", userCompanyId);
      
      // Get all sale items, joining with ventas table to filter by company_id
      const { data: ventaItems, error: ventaItemsError } = await supabase
        .from('venta_items')
        .select('producto_id, producto_nombre, cantidad, venta_id, ventas!inner(company_id)')
        .eq('ventas.company_id', userCompanyId);
      
      if (ventaItemsError) throw ventaItemsError;
      
      if (ventaItems) {
        // Group and sum quantities by product
        const productosTotales: Record<string, { id: string; nombre: string; cantidad: number }> = {};
        let cantidadTotal = 0;
        
        ventaItems.forEach(item => {
          const productoId = item.producto_id || 'sin-id';
          
          if (!productosTotales[productoId]) {
            productosTotales[productoId] = {
              id: productoId,
              nombre: item.producto_nombre,
              cantidad: 0
            };
          }
          
          productosTotales[productoId].cantidad += item.cantidad;
          cantidadTotal += item.cantidad;
        });
        
        // Convert to array and sort by quantity (descending)
        const sortedProductos = Object.values(productosTotales)
          .sort((a, b) => b.cantidad - a.cantidad);
        
        // Take top 5 products
        const top5 = sortedProductos.slice(0, 5);
        const others = sortedProductos.slice(5);
        const othersQuantity = others.reduce((sum, product) => sum + product.cantidad, 0);
        
        // Calculate percentages and assign colors
        const colors = ['#06b6d4', '#f472b6', '#facc15', '#a78bfa', '#34d399', '#f87171'];
        
        const formattedProducts: ProductoMasVendido[] = top5.map((product, index) => ({
          id: product.id,
          nombre: product.nombre,
          cantidadVendida: product.cantidad,
          porcentaje: Math.round((product.cantidad / cantidadTotal) * 100),
          color: colors[index]
        }));
        
        // Add "Others" category if needed
        if (others.length > 0) {
          formattedProducts.push({
            id: 'others',
            nombre: 'Otros',
            cantidadVendida: othersQuantity,
            porcentaje: Math.round((othersQuantity / cantidadTotal) * 100),
            color: colors[5]
          });
        }
        
        setProductosMasVendidos(formattedProducts);
      }
    } catch (error) {
      console.error("Error fetching most sold products:", error);
      toast.error("Error al cargar los productos más vendidos");
    } finally {
      setIsLoading(false);
    }
  };

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground p-2 rounded-md shadow-md border border-border text-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-muted-foreground">{`${payload[0].value}% (${payload[0].payload.cantidadVendida} unidades)`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-primary" />
          Productos Más Vendidos
        </CardTitle>
        <CardDescription>Distribución de productos con mayores ventas</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : productosMasVendidos.length > 0 ? (
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={productosMasVendidos}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  outerRadius={100}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="porcentaje"
                  nameKey="nombre"
                  paddingAngle={2}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return percent > 0.07 ? (
                      <text
                        x={x}
                        y={y}
                        fill="#fff"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        fontSize={15}
                        fontWeight={700}
                        style={{ textShadow: '0 2px 8px #000a' }}
                      >
                        {`${Math.round(percent * 100)}%`}
                      </text>
                    ) : null;
                  }}
                >
                  {productosMasVendidos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} wrapperStyle={{ background: '#1e293b', color: '#fff', borderRadius: 8, border: 'none', boxShadow: '0 2px 12px #0009' }} />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '13px', marginTop: '10px', color: '#fff', fontWeight: 600 }}
                  iconType="circle"
                  formatter={(value, entry) => {
                    const producto = productosMasVendidos.find(p => p.nombre === value);
                    return (
                      <span style={{ color: producto?.color, fontWeight: 700 }}>{value}</span>
                    );
                  }}
                />
              </PieChart>
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

export default TopSellingProducts;
