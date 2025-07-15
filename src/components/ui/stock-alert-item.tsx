
import React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, PackageOpen } from "lucide-react";

interface StockAlertItemProps {
  name: string;
  stock: number;
  className?: string;
  stockThreshold?: number;
}

const StockAlertItem: React.FC<StockAlertItemProps> = ({
  name,
  stock,
  className,
  stockThreshold = 5,
}) => {
  const isCritical = stock >= 0 && stock <= 3;
  const isWarning = stock >= 4 && stock <= 5;

  return (
    <div className={cn(
      "p-4 rounded-md border transition-all hover:shadow-sm",
      isCritical
        ? "border-red-500/20 bg-red-500/5"
        : isWarning
        ? "border-warning/20 bg-warning/5"
        : undefined,
      className
    )}>
      <div className="flex items-center gap-3">
        {(isCritical || isWarning) && (
          <div className={cn(
            "p-2 rounded-full",
            isCritical
              ? "bg-red-500/10 text-red-500"
              : isWarning
              ? "bg-warning/10 text-warning"
              : undefined
          )}>
            {isCritical ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <PackageOpen className="h-4 w-4" />
            )}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium truncate">{name}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Stock:</span>
            <span className={cn(
              "text-xs font-medium",
              isCritical
                ? "text-red-500"
                : isWarning
                ? "text-warning"
                : undefined
            )}>
              {stock} unidades
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAlertItem;
