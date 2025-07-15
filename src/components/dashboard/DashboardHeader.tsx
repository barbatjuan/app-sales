
import React from "react";
import { Calendar } from "lucide-react";
import { useAjustesStore } from "@/store/ajustesStore";
import NuevaVentaButton from "@/components/dashboard/NuevaVentaButton";

const DashboardHeader = () => {
  const { nombreSistema } = useAjustesStore();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 pl-12 sm:pl-0">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-2 sm:mb-0">Dashboard - {nombreSistema}</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString()}
          </span>
        </div>
        <NuevaVentaButton />
      </div>
    </div>
  );
};

export default DashboardHeader;
