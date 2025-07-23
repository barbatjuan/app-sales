import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, ChevronRight, MoreHorizontal, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Venta } from "@/types";
import { toast } from "sonner";
import { useAjustesStore } from "@/store/ajustesStore";
import { useMoneda } from "@/hooks/useMoneda";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Interface to handle the join data returned from Supabase
interface VentaConCliente {
  id: string;
  cliente_id: string | null;
  estado: string;
  estado_pago: string;
  fecha: string | null;
  total: number;
  clientes: {
    nombre: string;
  };
}

const PendingSales: React.FC = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useMoneda();
  const [ventasPendientes, setVentasPendientes] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingSales();
  }, []);

  const fetchPendingSales = async () => {
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
      console.log("Company ID del usuario en PendingSales:", userCompanyId);

      // Fetch pending sales
      const { data: ventasData, error: ventasError } = await supabase
        .from("ventas")
        .select("*, clientes!inner(nombre)")
        .eq("company_id", userCompanyId) // Filtrar por company_id
        .in("estado", ["pendiente", "preparacion", "listo"])
        .order("fecha", { ascending: false })
        .limit(5);

      if (ventasError) throw ventasError;

      if (ventasData) {
        // Transform the data to match the Venta type
        const ventasFormateadas: Venta[] = ventasData.map(
          (venta: VentaConCliente) => ({
            id: venta.id,
            cliente_id: venta.cliente_id,
            cliente_nombre: venta.clientes.nombre,
            fecha: venta.fecha,
            total: venta.total,
            estado: venta.estado as
              | "pendiente"
              | "preparacion"
              | "listo"
              | "entregado"
              | "completada"
              | "cancelada",
            estado_pago: venta.estado_pago as "pagado" | "pendiente",
          })
        );

        setVentasPendientes(ventasFormateadas);
      }
    } catch (error) {
      console.error("Error fetching pending sales:", error);
      toast.error("Error al cargar las ventas pendientes");
    } finally {
      setIsLoading(false);
    }
  };

  const updateVentaEstado = async (
    id: string,
    estado:
      | "pendiente"
      | "preparacion"
      | "listo"
      | "entregado"
      | "completada"
      | "cancelada"
  ) => {
    try {
      const { error } = await supabase
        .from("ventas")
        .update({ estado })
        .eq("id", id);

      if (error) throw error;

      // Actualiza inmediatamente el estado en la UI
      setVentasPendientes((prev) =>
        prev.map((venta) => (venta.id === id ? { ...venta, estado } : venta))
      );

      toast.success(`Estado de venta actualizado a ${estado}`);
      
      // Solo refresca si el estado es entregado (para eliminarlo de la lista)
      if (estado === "entregado") {
        setTimeout(() => fetchPendingSales(), 500);
      }
    } catch (error) {
      console.error("Error updating sale status:", error);
      toast.error("Error al actualizar el estado de la venta");
    }
  };
  
  // Función para actualizar el estado de pago
  const updateEstadoPago = async (id: string, estadoPago: "pagado" | "pendiente") => {
    try {
      const { error } = await supabase
        .from("ventas")
        .update({ estado_pago: estadoPago })
        .eq("id", id);

      if (error) throw error;

      // Actualiza inmediatamente el estado en la UI
      setVentasPendientes((prev) =>
        prev.map((venta) => (venta.id === id ? { ...venta, estado_pago: estadoPago } : venta))
      );

      toast.success(`Estado de pago actualizado a ${estadoPago}`);
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Error al actualizar el estado de pago");
    }
  };

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  // Usamos el formatCurrency del hook useMoneda

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "preparacion":
        return "processing";
      case "listo":
        return "ready";
      case "entregado":
        return "delivered";
      default:
        return "outline";
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case "preparacion":
        return "En preparación";
      case "listo":
        return "Listo";
      case "entregado":
        return "Entregado";
      default:
        return "Pendiente";
    }
  };

  const navigateToVentas = () => {
    navigate("/ventas");
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Package className="h-5 w-5" style={{ color: "#E31452" }} />
              Ventas Pendientes de Entregar
            </CardTitle>
            <CardDescription>
              Pedidos que necesitan ser procesados
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={navigateToVentas}>
            Ver todas
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-medium text-sm text-muted-foreground">
                  Cliente
                </th>
                <th className="pb-3 font-medium text-sm text-muted-foreground">
                  Fecha
                </th>
                <th className="pb-3 font-medium text-sm text-muted-foreground">
                  Total
                </th>
                <th className="pb-3 font-medium text-sm text-muted-foreground">
                  Estado
                </th>
                <th className="pb-3 font-medium text-sm text-muted-foreground">
                  Pago
                </th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && ventasPendientes.length > 0 ? (
                ventasPendientes.map((venta) => (
                  <tr
                    key={venta.id}
                    className={`border-b border-border hover:bg-muted/20 transition-colors ${venta.estado_pago === 'pendiente' ? 'border-destructive/20 bg-destructive/5' : ''}`}
                  >
                    <td className="py-3 text-sm">
                      {venta.cliente_nombre || "Cliente no disponible"}
                    </td>
                    <td className="py-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {venta.fecha ? formatDate(venta.fecha) : "N/A"}
                      </div>
                    </td>
                    <td className="py-3 text-sm font-medium">
                      {formatCurrency(venta.total)}
                    </td>
                    <td className="py-3 text-sm">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="p-0 h-auto">
                            <Badge
                              variant={getEstadoBadgeVariant(venta.estado)}
                              className="whitespace-nowrap flex items-center gap-1"
                            >
                              {getEstadoLabel(venta.estado)}
                              <ChevronRight className="h-3 w-3 ml-0.5 opacity-70" />
                            </Badge>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onSelect={() => updateVentaEstado(venta.id, "pendiente")}>Pendiente</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => updateVentaEstado(venta.id, "preparacion")}>En Preparación</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => updateVentaEstado(venta.id, "listo")}>Listo</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => updateVentaEstado(venta.id, "entregado")}>Entregado</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td className="py-3 text-sm">
                      <Button 
                        variant="ghost" 
                        className="p-0 h-auto" 
                        onClick={() => {
                          // Alternar entre pagado y pendiente
                          const nextPaymentState = venta.estado_pago === 'pagado' ? 'pendiente' : 'pagado';
                          updateEstadoPago(venta.id, nextPaymentState);
                        }}
                      >
                        {venta.estado_pago === 'pagado' ? (
                          <Badge variant="success" className="whitespace-nowrap">
                            Pagado
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Pendiente</span>
                          </div>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 text-center text-muted-foreground"
                  >
                    {isLoading
                      ? "Cargando ventas pendientes..."
                      : "No hay ventas pendientes de entregar."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingSales;
