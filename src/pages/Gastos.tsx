import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { 
  Card,
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Plus, Calendar, Trash2, Edit, 
  DollarSign, FileText, Loader2, Filter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Gasto, CategoriaGasto } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { GastoForm } from "@/components/forms/GastoForm";
import { DeleteGastoDialog } from "@/components/gastos/DeleteGastoDialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAjustesStore } from "@/store/ajustesStore";

const Gastos: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gastoToEdit, setGastoToEdit] = useState<Gasto | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [gastoToDelete, setGastoToDelete] = useState<string | null>(null);
  const [categoriaFilter, setCategoriaFilter] = useState<CategoriaGasto | "todas">("todas");
  const { monedaPredeterminada } = useAjustesStore();
  
  useEffect(() => {
    fetchGastos();
  }, []);
  
  const fetchGastos = async () => {
    try {
      setIsLoading(true);
      
      // Nota: La tabla 'gastos' debe ser creada en Supabase antes de usar esta función
      // Usar try-catch para manejar el caso donde la tabla no existe aún
      try {
        const { data, error } = await supabase
          .from('gastos')
          .select('*')
          .order('fecha', { ascending: false }) as any;
          
        if (error) throw error;
        
        if (data) {
          setGastos(data as Gasto[]);
        }
      } catch (supabaseError: any) {
        // Si el error es porque la tabla no existe, mostrar un mensaje específico
        if (supabaseError.message?.includes('does not exist')) {
          console.error('La tabla gastos no existe en la base de datos');
          toast.error('La tabla de gastos aún no ha sido creada en la base de datos');
        } else {
          throw supabaseError;
        }
      }
    } catch (error) {
      console.error('Error al cargar los gastos:', error);
      toast.error('Error al cargar los gastos');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditGasto = (gasto: Gasto) => {
    setGastoToEdit(gasto);
    setIsFormOpen(true);
  };
  
  const handleDeleteGasto = (id: string) => {
    setGastoToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const formatCurrency = (amount: number) => {
    return `${monedaPredeterminada === 'USD' ? '$' : monedaPredeterminada} ${Math.round(amount)}`;
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d 'de' MMMM, yyyy", { locale: es });
    } catch (e) {
      return dateString;
    }
  };
  
  const getCategoriaLabel = (categoria: CategoriaGasto) => {
    const categorias = {
      alquiler: 'Alquiler',
      servicios: 'Servicios',
      salarios: 'Salarios',
      insumos: 'Insumos',
      marketing: 'Marketing',
      impuestos: 'Impuestos',
      mantenimiento: 'Mantenimiento',
      transporte: 'Transporte',
      otros: 'Otros'
    };
    
    return categorias[categoria] || categoria;
  };
  
  const getCategoriaVariant = (categoria: CategoriaGasto): "outline" | "secondary" | "default" | "destructive" | "success" | "warning" | "brand" | "category" | "processing" | "ready" | "delivered" => {
    const variants: Record<CategoriaGasto, "outline" | "secondary" | "default" | "destructive" | "success" | "warning" | "brand" | "category" | "processing" | "ready" | "delivered"> = {
      alquiler: 'outline',
      servicios: 'secondary',
      salarios: 'default',
      insumos: 'destructive',
      marketing: 'success',
      impuestos: 'warning',
      mantenimiento: 'outline',
      transporte: 'secondary',
      otros: 'outline'
    };
    
    return variants[categoria];
  };
  
  const filteredGastos = gastos.filter(gasto => {
    const matchesSearch = 
      gasto.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gasto.notas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoriaLabel(gasto.categoria).toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategoria = categoriaFilter === "todas" || gasto.categoria === categoriaFilter;
    
    return matchesSearch && matchesCategoria;
  });
  
  const totalGastosFiltrados = filteredGastos.reduce((sum, gasto) => 
    gasto.estado === 'activo' ? sum + gasto.monto : sum, 0
  );
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold pl-12 sm:pl-0">Gastos</h1>
          <Button className="flex items-center gap-2" onClick={() => {
            setGastoToEdit(null);
            setIsFormOpen(true);
          }}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Gasto</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>
        
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Registro de Gastos</CardTitle>
            <CardDescription>
              Control de gastos y egresos de la empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="relative px-2">
                <Search className="absolute left-5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar gasto..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span>Categoría: {categoriaFilter === "todas" ? "Todas" : getCategoriaLabel(categoriaFilter)}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setCategoriaFilter("todas")}>
                      Todas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoriaFilter("alquiler")}>
                      Alquiler
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoriaFilter("servicios")}>
                      Servicios
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoriaFilter("salarios")}>
                      Salarios
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoriaFilter("insumos")}>
                      Insumos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoriaFilter("marketing")}>
                      Marketing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoriaFilter("impuestos")}>
                      Impuestos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoriaFilter("mantenimiento")}>
                      Mantenimiento
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoriaFilter("transporte")}>
                      Transporte
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoriaFilter("otros")}>
                      Otros
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center justify-end">
                <div className="text-sm text-muted-foreground">
                  Total: <span className="font-bold text-foreground">{formatCurrency(totalGastosFiltrados)}</span>
                </div>
              </div>
            </div>
            
            <div className="rounded-md border">
              {isLoading ? (
                <div className="flex justify-center items-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Cargando gastos...</span>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[#6ED19E]">Concepto</TableHead>
                        <TableHead className="text-[#6ED19E]">Categoría</TableHead>
                        <TableHead className="text-[#6ED19E]">Fecha</TableHead>
                        <TableHead className="text-[#6ED19E] text-right">Monto</TableHead>
                        <TableHead className="text-[#6ED19E] text-center">Recurrente</TableHead>
                        <TableHead className="text-[#6ED19E] text-center">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGastos.length > 0 ? (
                        filteredGastos.map((gasto) => (
                          <TableRow 
                            key={gasto.id}
                            className={gasto.estado === 'anulado' ? 'opacity-60' : ''}
                          >
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{gasto.concepto}</span>
                                {gasto.notas && (
                                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {gasto.notas}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getCategoriaVariant(gasto.categoria)}>
                                {getCategoriaLabel(gasto.categoria)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{formatDate(gasto.fecha)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {formatCurrency(gasto.monto)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {gasto.recurrente ? (
                                <Badge variant="outline">
                                  {gasto.frecuencia || 'Mensual'}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">No</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => handleEditGasto(gasto)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => handleDeleteGasto(gasto.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                            {searchTerm || categoriaFilter !== "todas" ? 
                              "No se encontraron gastos con los criterios de búsqueda." :
                              "No hay gastos registrados. ¡Registra tu primer gasto!"
                            }
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <GastoForm 
        open={isFormOpen} 
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            fetchGastos();
          }
        }} 
        gastoToEdit={gastoToEdit}
      />

      {gastoToDelete && (
        <DeleteGastoDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          gastoId={gastoToDelete}
          onGastoDeleted={fetchGastos}
        />
      )}
    </MainLayout>
  );
};

export default Gastos;
