
import React from "react";
import DashboardStats from "./DashboardStats";
import LowStockAlert from "./LowStockAlert";
import SalesAnalysis from "./SalesAnalysis";
import TopProductsCard from "./TopProductsCard";
import PendingSales from "./PendingSales";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useMonthlySales } from "@/hooks/useMonthlySales";

const DashboardContent = () => {
  const { dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { ventasMensuales, isLoading: salesLoading } = useMonthlySales();

  return (
    <div className="space-y-5">
      {!statsLoading && <DashboardStats stats={dashboardStats} />}
      <LowStockAlert />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SalesAnalysis 
          ventasMensuales={ventasMensuales}
          isLoading={salesLoading}
        />
        <TopProductsCard />
      </div>
      <PendingSales />
    </div>
  );
};

export default DashboardContent;
