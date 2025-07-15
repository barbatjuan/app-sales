
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats } from "@/types";
import { toast } from "sonner";

export const useDashboardStats = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    ingresos_totales: 0,
    ventas_ultimo_mes: 0,
    ventas_mes_anterior: 0,
    valor_promedio: 0,
    pedidos_pendiente_pago: 0,
    cantidad_ventas_pendientes: 0,
    total_pedidos_pendientes: 0,
    crecimiento_ingresos: 0,
    crecimiento_ventas: 0,
    crecimiento_valor: 0,
    crecimiento_pedidos_pendientes: 0,
    porcentaje_pedidos_pendientes: 0,
    clientes_nuevos_mes: 0,
    crecimiento_clientes: 0,
    porcentaje_cantidad_ventas_pendientes_change: 0,
    gastos_mes_actual: 0,
    gastos_mes_anterior: 0,
    crecimiento_gastos: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const calculateDashboardStats = async () => {
    // Primero obtenemos el company_id del usuario actual
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("No hay sesión activa");
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
    }
    
    const userCompanyId = profileData.company_id;
    console.log("Company ID del usuario:", userCompanyId);
    if (!userCompanyId) {
      throw new Error("El usuario no tiene company_id asignado");
    }
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1).toISOString();
      const lastDayCurrentMonth = new Date(currentYear, currentMonth + 1, 0).toISOString();
      const firstDayPreviousMonth = new Date(currentYear, currentMonth - 1, 1).toISOString();
      const lastDayPreviousMonth = new Date(currentYear, currentMonth, 0).toISOString();
      
      // Considera ventas con estado activo (no solo 'completada')
      const estadosValidos = ['completada', 'pendiente', 'preparacion', 'listo'];
      const { data: currentMonthSales, error: currentMonthError } = await supabase
        .from('ventas')
        .select('total, estado, estado_pago, fecha')
        .eq('company_id', userCompanyId) // Filtrar por company_id
        .in('estado', estadosValidos)
        .gte('fecha', firstDayCurrentMonth)
        .lte('fecha', lastDayCurrentMonth);
      if (currentMonthError) throw currentMonthError;

      const { data: previousMonthSales, error: previousMonthError } = await supabase
        .from('ventas')
        .select('total, estado, estado_pago, fecha')
        .eq('company_id', userCompanyId) // Filtrar por company_id
        .in('estado', estadosValidos)
        .gte('fecha', firstDayPreviousMonth)
        .lte('fecha', lastDayPreviousMonth);
      if (previousMonthError) throw previousMonthError;
      
      // Solo pendientes del mes actual (NO filtrar por estado, solo por estado_pago y fecha)
      const { data: pendingPaymentSales, error: pendingPaymentError } = await supabase
        .from('ventas')
        .select('total, fecha, estado')
        .eq('company_id', userCompanyId) // Filtrar por company_id
        .eq('estado_pago', 'pendiente')
        .gte('fecha', firstDayCurrentMonth)
        .lte('fecha', lastDayCurrentMonth);
      if (pendingPaymentError) throw pendingPaymentError;

      // DEBUG: Ver logs de ventas del mes y pendientes
      console.log('Ventas mes actual:', currentMonthSales);
      console.log('Pendientes de pago mes actual:', pendingPaymentSales);

      const { data: currentMonthClients, error: currentMonthClientsError } = await supabase
        .from('clientes')
        .select('id')
        .eq('company_id', userCompanyId) // Filtrar por company_id
        .gte('fecha_registro', firstDayCurrentMonth)
        .lte('fecha_registro', lastDayCurrentMonth);

      if (currentMonthClientsError) throw currentMonthClientsError;

      const { data: previousMonthClients, error: previousMonthClientsError } = await supabase
        .from('clientes')
        .select('id')
        .eq('company_id', userCompanyId) // Filtrar por company_id
        .gte('fecha_registro', firstDayPreviousMonth)
        .lte('fecha_registro', lastDayPreviousMonth);

      if (previousMonthClientsError) throw previousMonthClientsError;
      
      // Obtener datos de gastos del mes actual y anterior
      let gastosMesActual = 0;
      let gastosMesAnterior = 0;
      
      try {
        // Intentamos obtener los gastos del mes actual
        const { data: currentMonthExpenses, error: currentMonthExpensesError } = await supabase
          .from('gastos')
          .select('monto')
          .eq('company_id', userCompanyId) // Filtrar por company_id
          .eq('estado', 'activo')
          .gte('fecha', firstDayCurrentMonth)
          .lte('fecha', lastDayCurrentMonth) as any;
          
        if (!currentMonthExpensesError && currentMonthExpenses) {
          gastosMesActual = currentMonthExpenses.reduce((sum: number, expense: any) => sum + Number(expense.monto), 0);
        }
        
        // Gastos del mes anterior
        const { data: previousMonthExpenses, error: previousMonthExpensesError } = await supabase
          .from('gastos')
          .select('monto')
          .eq('company_id', userCompanyId) // Filtrar por company_id
          .eq('estado', 'activo')
          .gte('fecha', firstDayPreviousMonth)
          .lte('fecha', lastDayPreviousMonth) as any;
          
        if (!previousMonthExpensesError && previousMonthExpenses) {
          gastosMesAnterior = previousMonthExpenses.reduce((sum: number, expense: any) => sum + Number(expense.monto), 0);
        }
      } catch (error) {
        console.error("Error al obtener datos de gastos:", error);
        // No lanzamos el error para que no falle todo el dashboard si la tabla no existe
      }
      
      // Ingresos y ventas: suma y cantidad de todas las ventas válidas
      const ingresosMesActual = currentMonthSales ? currentMonthSales.reduce((sum, sale) => sum + Number(sale.total), 0) : 0;
      const ingresosMesAnterior = previousMonthSales ? previousMonthSales.reduce((sum, sale) => sum + Number(sale.total), 0) : 0;
      const ventasUltimoMes = currentMonthSales ? currentMonthSales.length : 0;
      const ventasMesAnterior = previousMonthSales ? previousMonthSales.length : 0;
      const valorPromedio = ventasUltimoMes > 0 
        ? (ingresosMesActual / ventasUltimoMes) 
        : 0;
      const valorPromedioAnterior = ventasMesAnterior > 0
        ? (ingresosMesAnterior / ventasMesAnterior)
        : 0;
      // Total de pedidos pendientes de pago solo del mes actual
      const totalPedidosPendientes = pendingPaymentSales 
        ? pendingPaymentSales.reduce((sum, sale) => sum + Number(sale.total), 0) 
        : 0;
      const clientesNuevosMes = currentMonthClients ? currentMonthClients.length : 0;
      const clientesNuevosMesAnterior = previousMonthClients ? previousMonthClients.length : 0;
      
      const crecimientoIngresos = ingresosMesAnterior > 0 
        ? ((ingresosMesActual - ingresosMesAnterior) / ingresosMesAnterior) * 100 
        : (ingresosMesActual > 0 ? 100 : 0);
      const crecimientoVentas = ventasMesAnterior > 0 
        ? ((ventasUltimoMes - ventasMesAnterior) / ventasMesAnterior) * 100 
        : (ventasUltimoMes > 0 ? 100 : 0);
      const crecimientoValor = valorPromedioAnterior > 0 
        ? ((valorPromedio - valorPromedioAnterior) / valorPromedioAnterior) * 100 
        : 0;
      // Porcentaje: cantidad de ventas totales sobre cantidad de ventas pendientes de cobro
      const cantidadVentasPendientes = pendingPaymentSales ? pendingPaymentSales.length : 0;
      // Calcular la cantidad de ventas pendientes del mes anterior (NO filtrar por estado, solo por estado_pago y fecha)
      const { data: pendingPaymentSalesPrev, error: pendingPaymentPrevError } = await supabase
        .from('ventas')
        .select('id')
        .eq('company_id', userCompanyId) // Filtrar por company_id
        .eq('estado_pago', 'pendiente')
        .gte('fecha', firstDayPreviousMonth)
        .lte('fecha', lastDayPreviousMonth);
      if (pendingPaymentPrevError) throw pendingPaymentPrevError;

      // DEBUG: Ver logs de pendientes de pago mes anterior
      console.log('Pendientes de pago mes anterior:', pendingPaymentSalesPrev);
      const cantidadVentasPendientesAnterior = pendingPaymentSalesPrev ? pendingPaymentSalesPrev.length : 0;
      // Variación porcentual de cantidad de ventas pendientes
      const porcentajeCantidadVentasPendientesChange = cantidadVentasPendientesAnterior > 0
        ? ((cantidadVentasPendientes - cantidadVentasPendientesAnterior) / cantidadVentasPendientesAnterior) * 100
        : (cantidadVentasPendientes > 0 ? 100 : 0);
      const porcentajePendientes = ventasUltimoMes > 0
        ? (cantidadVentasPendientes / ventasUltimoMes) * 100
        : 0;
      const crecimientoClientes = clientesNuevosMesAnterior > 0
        ? ((clientesNuevosMes - clientesNuevosMesAnterior) / clientesNuevosMesAnterior) * 100
        : 0;
        
      // Calcular crecimiento de gastos
      const crecimientoGastos = gastosMesAnterior > 0
        ? ((gastosMesActual - gastosMesAnterior) / gastosMesAnterior) * 100
        : (gastosMesActual > 0 ? 100 : 0);
      
      // Cálculo seguro de beneficios
      const ingresosActual = Number.isFinite(ingresosMesActual) ? ingresosMesActual : 0;
      const ingresosAnterior = Number.isFinite(ingresosMesAnterior) ? ingresosMesAnterior : 0;
      const gastosActual = Number.isFinite(gastosMesActual) ? gastosMesActual : 0;
      const gastosAnterior = Number.isFinite(gastosMesAnterior) ? gastosMesAnterior : 0;
      const beneficiosMesActual = ingresosActual - gastosActual;
      const beneficiosMesAnterior = ingresosAnterior - gastosAnterior;
      const crecimientoBeneficios = beneficiosMesAnterior !== 0 ? ((beneficiosMesActual - beneficiosMesAnterior) / Math.abs(beneficiosMesAnterior)) * 100 : (beneficiosMesActual > 0 ? 100 : 0);

      const newStats: DashboardStats = {
        ingresos_totales: Math.round(ingresosActual),
        ventas_ultimo_mes: ventasUltimoMes,
        ventas_mes_anterior: ventasMesAnterior,
        valor_promedio: Math.round(valorPromedio),
        pedidos_pendiente_pago: Math.round(totalPedidosPendientes), // DEPRECATED, usar total_pedidos_pendientes
        cantidad_ventas_pendientes: cantidadVentasPendientes,
        porcentaje_cantidad_ventas_pendientes_change: Number(porcentajeCantidadVentasPendientesChange.toFixed(2)),
        total_pedidos_pendientes: Math.round(totalPedidosPendientes),
        crecimiento_ingresos: Number(crecimientoIngresos.toFixed(2)),
        crecimiento_ventas: Number(crecimientoVentas.toFixed(2)),
        crecimiento_valor: Number(crecimientoValor.toFixed(2)),
        crecimiento_pedidos_pendientes: Number(crecimientoVentas.toFixed(2)),
        porcentaje_pedidos_pendientes: Number(porcentajePendientes.toFixed(2)),
        clientes_nuevos_mes: clientesNuevosMes,
        crecimiento_clientes: Number(crecimientoClientes.toFixed(2)),
        gastos_mes_actual: Math.round(gastosActual),
        gastos_mes_anterior: Math.round(gastosAnterior),
        crecimiento_gastos: Number(crecimientoGastos.toFixed(2)),
        beneficios_mes_actual: Math.round(beneficiosMesActual),
        beneficios_mes_anterior: Math.round(beneficiosMesAnterior),
        crecimiento_beneficios: Number(crecimientoBeneficios.toFixed(2)),
      };
      
      setDashboardStats(newStats);
      

      
    } catch (error) {
      console.error("Error calculating dashboard stats:", error);
      throw error;
    }
  };

  useEffect(() => {
    calculateDashboardStats()
      .catch(() => toast.error('Error al calcular las estadísticas del dashboard'))
      .finally(() => setIsLoading(false));
  }, []);

  return { dashboardStats, isLoading };
};
