import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, DollarSign } from "lucide-react";
import { useAjustesStore } from "@/store/ajustesStore";

interface ClienteDeudor {
  id: string;
  nombre: string;
  deuda_total: number;
}

const TopDebtors: React.FC = () => {
  const [deudores, setDeudores] = useState<ClienteDeudor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { monedaPredeterminada } = useAjustesStore();

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
      console.log("Company ID del usuario en TopDebtors:", userCompanyId);

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
        
        // Procesar cada venta
        data.forEach(venta => {
          if (!venta.cliente_id || !venta.clientes) return;
          
          const clienteId = venta.cliente_id;
          const clienteNombre = venta.clientes.nombre;
          const monto = venta.total || 0;
          
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
        
        // Convertir a array, ordenar y tomar los 5 primeros
        const topDeudores = Object.values(deudoresMapa)
          .sort((a: any, b: any) => b.deuda_total - a.deuda_total)
          .slice(0, 5);
        
        setDeudores(topDeudores as ClienteDeudor[]);
      } else {
        setDeudores([]);
      }
    } catch (error) {
      console.error("Error obteniendo clientes deudores:", error);
      setDeudores([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `${monedaPredeterminada === "USD" ? "$" : monedaPredeterminada} ${Math.round(value)}`;
  };

  // Datos de ejemplo para desarrollo y pruebas
  const clientesEjemplo: ClienteDeudor[] = [
    { id: '1', nombre: 'Juan Pérez', deuda_total: 15000 },
    { id: '2', nombre: 'María González', deuda_total: 12500 },
    { id: '3', nombre: 'Carlos Rodríguez', deuda_total: 9800 },
    { id: '4', nombre: 'Ana Martínez', deuda_total: 7500 },
    { id: '5', nombre: 'Luis Sánchez', deuda_total: 5200 }
  ];

  // Usar datos reales si están disponibles, o datos de ejemplo si no hay datos
  const clientesAMostrar = deudores.length > 0 ? deudores : clientesEjemplo;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span>Clientes con Deudas</span>
          <div className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-6 text-center text-muted-foreground">
            Cargando clientes con deudas...
          </div>
        ) : (
          <div className="space-y-3">
            {clientesAMostrar.map((cliente) => (
              <div
                key={cliente.id}
                className="flex items-center justify-between p-2 rounded-md border border-destructive/10 bg-destructive/5"
              >
                <div className="flex-1 truncate">
                  <p className="font-medium text-sm truncate">{cliente.nombre}</p>
                </div>
                <div className="flex items-center gap-1 text-destructive font-semibold">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>{formatCurrency(cliente.deuda_total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopDebtors;
