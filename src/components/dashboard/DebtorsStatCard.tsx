import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, DollarSign } from "lucide-react";
import { useAjustesStore } from "@/store/ajustesStore";
import { useMoneda } from "@/hooks/useMoneda";
import { cn } from "@/lib/utils";

interface ClienteDeudor {
  id: string;
  nombre: string;
  deuda_total: number;
}

const DebtorsStatCard: React.FC = () => {
  const [deudores, setDeudores] = useState<ClienteDeudor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalDeuda, setTotalDeuda] = useState(0);
  const { formatCurrency } = useMoneda();

  useEffect(() => {
    fetchTopDebtors();
  }, []);

  const fetchTopDebtors = async () => {
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
      console.log("Company ID del usuario en DebtorsStatCard:", userCompanyId);

      // Consulta simple para obtener ventas con pago pendiente
      const { data, error } = await supabase
        .from("ventas")
        .select(`
          cliente_id,
          total,
          clientes(nombre)
        `)
        .eq("company_id", userCompanyId) // Filtrar por company_id
        .eq("estado_pago", "pendiente");

      if (error) throw error;

      if (data && data.length > 0) {
        // Crear un mapa para agrupar por cliente
        const deudoresMapa = {};
        let sumaTotalDeudas = 0;
        
        // Procesar cada venta
        data.forEach(venta => {
          if (!venta.cliente_id || !venta.clientes) return;
          
          const clienteId = venta.cliente_id;
          const clienteNombre = venta.clientes.nombre;
          const monto = venta.total || 0;
          
          sumaTotalDeudas += monto;
          
          // Si el cliente ya existe, sumar a su deuda
          if (deudoresMapa[clienteId]) {
            deudoresMapa[clienteId].deuda_total += monto;
          } else {
            // Si es nuevo, crear entrada
            deudoresMapa[clienteId] = {
              id: clienteId,
              nombre: clienteNombre,
              deuda_total: monto
            };
          }
        });
        
        // Convertir a array, ordenar y tomar los 3 primeros
        const topDeudores = Object.values(deudoresMapa)
          .sort((a: any, b: any) => b.deuda_total - a.deuda_total)
          .slice(0, 3);
        
        setDeudores(topDeudores as ClienteDeudor[]);
        setTotalDeuda(sumaTotalDeudas);
      } else {
        setDeudores([]);
        setTotalDeuda(0);
      }
    } catch (error) {
      console.error("Error obteniendo clientes deudores:", error);
      setDeudores([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Usamos el formatCurrency del hook useMoneda

  // Usar solo datos reales
  const clientesAMostrar = deudores;
  const deudaTotal = totalDeuda;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Clientes con Deudas
        </CardTitle>
        <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-[#E31452]/10 text-[#E31452]">
          <AlertTriangle className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-[#E31452]">
            {formatCurrency(deudaTotal)}
          </div>
          <div className="space-y-1 mt-2">
            {clientesAMostrar.map((cliente) => (
              <div
                key={cliente.id}
                className="flex items-center justify-between text-xs"
              >
                <span className="truncate max-w-[120px]">{cliente.nombre}</span>
                <span className="font-medium text-[#E31452] flex items-center">
                  
                  {formatCurrency(cliente.deuda_total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtorsStatCard;
