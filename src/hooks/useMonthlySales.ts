
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VentaMensual } from "@/types";
import { toast } from "sonner";

export const useMonthlySales = () => {
  const [ventasMensuales, setVentasMensuales] = useState<VentaMensual[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMonthlySalesData = async () => {
    try {
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
      console.log("Company ID del usuario en useMonthlySales:", userCompanyId);

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
        .eq('company_id', userCompanyId) // Filtrar por company_id
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
