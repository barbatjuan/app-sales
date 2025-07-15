import type { DashboardStats } from "@/types";
import StatCard from "@/components/ui/stat-card";
import { DollarSign, ShoppingBag, CreditCard, ArrowUp, ArrowDown, Receipt } from "lucide-react";
import { useAjustesStore } from "@/store/ajustesStore";
import DebtorsStatCard from "./DebtorsStatCard";

interface DashboardStatsProps {
  stats: DashboardStats;
}

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const { monedaPredeterminada } = useAjustesStore();
  
  const formatCurrency = (value: number) => {
    return `${monedaPredeterminada === 'USD' ? '$' : monedaPredeterminada} ${Math.round(value)}`;
  };

  const renderTrendIcon = (isPositive: boolean) => {
    return isPositive ? (
      <ArrowUp className="h-4 w-4 text-success ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 text-destructive ml-1" />
    );
  };

  const ventasDiferencia = stats.ventas_ultimo_mes - stats.ventas_mes_anterior;
  const ventasIncreased = ventasDiferencia >= 0;

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      <StatCard
        title="Ingresos del Mes"
        value={formatCurrency(stats.ingresos_totales)}
        percentageChange={stats.crecimiento_ingresos}
        icon={<DollarSign className="h-5 w-5" />}
      />
      <StatCard
        title="Ventas del Mes"
        value={stats.ventas_ultimo_mes}
        percentageChange={stats.crecimiento_ventas}
        icon={<ShoppingBag className="h-5 w-5" />}
        trendIcon={renderTrendIcon(ventasIncreased)}
        trendDescription={`${ventasIncreased ? "+" : ""}${ventasDiferencia}`}
      />
      <StatCard
        title="Beneficios del Mes"
        value={formatCurrency(stats.beneficios_mes_actual)}
        percentageChange={undefined}
        icon={<Receipt className="h-5 w-5" />}
        trendDescription={`<span style='color: #e53935'>Gastos: ${formatCurrency(stats.gastos_mes_actual)}</span>`}
        color={stats.beneficios_mes_actual < 0 ? "red" : "green"}
      />
      <StatCard
        title="Pendientes de Pago"
        value={`${stats.porcentaje_pedidos_pendientes.toFixed(0)}%`}
        percentageChange={stats.porcentaje_cantidad_ventas_pendientes_change}
        icon={<CreditCard className="h-5 w-5" />}
        trendDescription={`${stats.cantidad_ventas_pendientes} ${stats.cantidad_ventas_pendientes === 1 ? 'venta' : 'ventas'}`}
        color="red"
      />
      <DebtorsStatCard />
    </div>
  );
};

export default DashboardStats;
