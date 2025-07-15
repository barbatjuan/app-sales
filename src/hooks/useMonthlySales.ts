
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VentaMensual } from "@/types";
import { toast } from "sonner";

export const useMonthlySales = () => {
  const [ventasMensuales, setVentasMensuales] = useState<VentaMensual[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMonthlySalesData = async () => {
    try {
      const currentYear = new Date().getFullYear();
      
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const monthlyData: VentaMensual[] = monthNames.map((mes, index) => ({
        mes,
        ventas: 0,
        pedidos: 0
      }));
      
      const { data: yearlySales, error: yearlySalesError } = await supabase
        .from('ventas')
        .select('total, fecha')
        .gte('fecha', `${currentYear}-01-01`)
        .lte('fecha', `${currentYear}-12-31`);
      
      if (yearlySalesError) throw yearlySalesError;
      
      if (yearlySales) {
        yearlySales.forEach(sale => {
          const saleDate = new Date(sale.fecha);
          const monthIndex = saleDate.getMonth();
          
          monthlyData[monthIndex].ventas += Number(sale.total);
          monthlyData[monthIndex].pedidos += 1;
        });
      }
      
      monthlyData.forEach(data => {
        data.ventas = Math.round(data.ventas);
      });
      
      setVentasMensuales(monthlyData);
    } catch (error) {
      console.error("Error fetching monthly sales data:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchMonthlySalesData()
      .catch(() => toast.error("Error al cargar los datos de ventas mensuales"))
      .finally(() => setIsLoading(false));
  }, []);

  return { ventasMensuales, isLoading };
};
