import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  percentageChange?: number;
  icon?: React.ReactNode;
  className?: string;
  isCurrency?: boolean;
  trendIcon?: React.ReactNode;
  trendDescription?: string;
}

import { ChefHatIcon } from "./ChefHatIcon";

export default function StatCard({
  title,
  value,
  percentageChange,
  icon,
  className,
  isCurrency = false,
  trendIcon,
  trendDescription,
  color,
}: StatCardProps & { color?: 'red' | 'green' }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const displayValue =
    isCurrency && typeof value === "number" ? formatCurrency(value) : value;

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm border-border/50",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center",
            color === 'red'
              ? 'bg-[#E31452]/10 text-[#E31452]'
              : 'bg-primary/10'
          )}>
            <ChefHatIcon className="h-6 w-6" />
          </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className={cn("text-2xl font-bold", color === 'red' ? 'text-[#E31452]' : '')} style={color === 'green' ? { color: '#6ED19E' } : {}}>{displayValue}</div>
          {(percentageChange !== undefined || trendDescription) && (
            <div className="flex items-center gap-1.5">
              {percentageChange !== undefined && (
  <span
    className={cn(
      "text-sm font-medium flex items-center gap-1",
      percentageChange < 0 ? "text-[#E31452]" : ""
    )}
    style={percentageChange > 0 ? { color: '#6ED19E' } : {}}
  >
    {percentageChange > 0 && (
      <ArrowUp className="mr-1 h-3 w-3" style={{ color: '#6ED19E' }} />
    )}
    {percentageChange < 0 && (
      <ArrowDown className="mr-1 h-3 w-3" style={{ color: '#E31452' }} />
    )}
    {percentageChange > 0 && '+'}
    {Math.abs(percentageChange)}%
  </span>
)}
              {trendDescription && (
                <span className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: trendDescription }} />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
