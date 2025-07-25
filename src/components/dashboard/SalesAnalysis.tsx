
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VentaMensual } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { BarChart4, TrendingUp, Loader2 } from "lucide-react";
import { useAjustesStore } from "@/store/ajustesStore";
import { useMoneda } from "@/hooks/useMoneda";

interface SalesAnalysisProps {
  ventasMensuales: VentaMensual[];
  isLoading: boolean;
}

const SalesAnalysis = ({ ventasMensuales, isLoading }: SalesAnalysisProps) => {
  const [activeChartTab, setActiveChartTab] = useState("ventas");
  const [isEdge, setIsEdge] = useState(false);
  const { moneda } = useMoneda();

  // Detectar Microsoft Edge
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isEdgeBrowser = /Edg\//.test(userAgent) || /Edge\//.test(userAgent);
    setIsEdge(isEdgeBrowser);
  }, []);

  const BarChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground p-2 rounded-md shadow-md border border-border text-sm">
          <p className="font-medium">{label}</p>
          <p className="text-muted-foreground">{`Ventas: ${moneda} ${payload[0].value}`}</p>
          <p className="text-muted-foreground">{`Pedidos: ${payload[1].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="lg:col-span-1 min-w-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Análisis de Ventas</CardTitle>
        <CardDescription>Evolución de ventas y pedidos por mes</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 overflow-x-auto">
        <Tabs value={activeChartTab} onValueChange={setActiveChartTab} className="w-full min-w-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ventas">
              <BarChart4 className="h-4 w-4 mr-2" />
              Ventas
            </TabsTrigger>
            <TabsTrigger value="tendencia">
              <TrendingUp className="h-4 w-4 mr-2" />
              Tendencia
            </TabsTrigger>
          </TabsList>
          <div className="h-[340px] w-full mt-3 min-w-0 chart-container">
            <TabsContent value="ventas" className="h-full mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div style={{ width: '100%', height: '340px', overflow: 'hidden' }}>
                  {isEdge ? (
                    // Versión optimizada para Edge - sin ResponsiveContainer
                    <BarChart 
                      width={600} 
                      height={340} 
                      data={ventasMensuales} 
                      margin={{ top: 5, right: 10, left: 10, bottom: 15 }}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="mes" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${moneda} ${value}`}
                      />
                      <Tooltip content={<BarChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                      <Bar 
                        name={`Ventas (${moneda})`} 
                        dataKey="ventas" 
                        fill="#3B82F6" 
                        radius={[2, 2, 0, 0]} 
                        barSize={16}
                        isAnimationActive={false}
                      />
                      <Bar 
                        name="Pedidos" 
                        dataKey="pedidos" 
                        fill="#10B981" 
                        radius={[2, 2, 0, 0]} 
                        barSize={16}
                        isAnimationActive={false}
                      />
                    </BarChart>
                  ) : (
                    // Versión normal para otros navegadores
                    <ResponsiveContainer width="100%" height={340}>
                      <BarChart data={ventasMensuales} margin={{ top: 5, right: 10, left: 0, bottom: 15 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="mes" 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${moneda} ${value}`}
                        />
                        <Tooltip content={<BarChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                        <Bar 
                          name={`Ventas (${moneda})`} 
                          dataKey="ventas" 
                          fill="#3B82F6" 
                          radius={[4, 4, 0, 0]} 
                          barSize={16}
                        />
                        <Bar 
                          name="Pedidos" 
                          dataKey="pedidos" 
                          fill="#10B981" 
                          radius={[4, 4, 0, 0]} 
                          barSize={16}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="tendencia" className="h-full mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div style={{ width: '100%', height: '340px', overflow: 'hidden' }}>
                  {isEdge ? (
                    // Versión optimizada para Edge - sin gradientes complejos
                    <AreaChart 
                      width={600} 
                      height={340} 
                      data={ventasMensuales} 
                      margin={{ top: 5, right: 10, left: 10, bottom: 15 }}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="mes" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${moneda} ${value}`}
                      />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="ventas" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        fill="#3B82F6" 
                        fillOpacity={0.3}
                        name={`Ventas (${moneda})`}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  ) : (
                    // Versión normal para otros navegadores
                    <ResponsiveContainer width="100%" height={340}>
                      <AreaChart data={ventasMensuales} margin={{ top: 5, right: 10, left: 0, bottom: 15 }}>
                        <defs>
                          <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="mes" 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${moneda} ${value}`}
                        />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="ventas" 
                          stroke="#3B82F6" 
                          fillOpacity={1} 
                          fill="url(#colorVentas)" 
                          name={`Ventas (${moneda})`}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SalesAnalysis;
