import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
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
  Search, Plus, ChevronDown, CheckCircle, 
  Printer, Trash2, Clock, ClipboardList, 
  Package, Truck as TruckIcon, Filter, 
  CreditCard, AlertCircle, Loader2
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VentaForm } from "@/components/forms/VentaForm";
import { toast } from "sonner";
import { Venta, VentaItem, Cliente } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { ClienteEditForm } from "@/components/forms/ClienteEditForm";
import { DeleteSaleDialog } from "@/components/sales/DeleteSaleDialog";
import SaleReceipt from "@/components/sales/SaleReceipt";

interface LocationState {
  openVentaForm?: boolean;
}

const Ventas: React.FC = () => {
  const location = useLocation();
  const locationState = location.state as LocationState;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [clienteSearchTerm, setClienteSearchTerm] = useState("");
  const [clientesList, setClientesList] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(locationState?.openVentaForm || false);
  const [ventasData, setVentasData] = useState<Venta[]>([]);
  const [filteredVentas, setFilteredVentas] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showClienteResults, setShowClienteResults] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isClienteEditOpen, setIsClienteEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  const prevIsFormOpenRef = React.useRef<boolean>();
  
  const clienteSearchRef = useRef<HTMLDivElement>(null);

  const fetchVentas = useCallback(async () => {
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
      console.log("Company ID del usuario en Ventas:", userCompanyId);
      
      const { data: ventas, error: ventasError } = await supabase
        .from('ventas')
        .select(`
          *,
          clientes:cliente_id (nombre)
        `)
        .eq('company_id', userCompanyId) // Filtrar por company_id
        .order('fecha', { ascending: false });
      
      if (ventasError) throw ventasError;
      
      if (ventas && ventas.length > 0) {
        const ventasWithItems: Venta[] = [];
        
        for (const venta of ventas) {
          const { data: items, error: itemsError } = await supabase
            .from('venta_items')
            .select('*')
            .eq('venta_id', venta.id);
          
          if (itemsError) throw itemsError;
          
          ventasWithItems.push({
            id: venta.id,
            cliente_id: venta.cliente_id,
            cliente_nombre: venta.clientes?.nombre || 'Cliente no encontrado',
            fecha: venta.fecha,
            total: venta.total,
            estado: venta.estado as 'completada' | 'pendiente' | 'cancelada' | 'preparacion' | 'listo' | 'entregado',
            estado_pago: venta.estado_pago as 'pagado' | 'pendiente',
            items: items as VentaItem[]
          });
        }
        
        setVentasData(ventasWithItems);
        setFilteredVentas(ventasWithItems);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Error al cargar las ventas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchClientes = useCallback(async () => {
    try {
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
      console.log("Company ID del usuario en fetchClientes:", userCompanyId);
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('company_id', userCompanyId) // Filtrar por company_id
        .eq('estado', 'activo');
        
      if (error) throw error;
      
      if (data) {
        const typedData: Cliente[] = data.map(cliente => ({
          ...cliente,
          estado: cliente.estado as 'activo' | 'inactivo'
        }));
        setClientesList(typedData);
      }
    } catch (error) {
      console.error('Error fetching clientes:', error);
      toast.error('Error al cargar los clientes');
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  function handleClickOutside(event: MouseEvent) {
    if (clienteSearchRef.current && !clienteSearchRef.current.contains(event.target as Node)) {
      setShowClienteResults(false);
    }
  }
  
  useEffect(() => {
    fetchVentas();
    fetchClientes();
  }, [fetchVentas, fetchClientes]);

  // Efecto para recargar ventas cuando el VentaForm se cierra
  useEffect(() => {
    if (prevIsFormOpenRef.current === true && !isFormOpen) {
      fetchVentas(); 
    }
    prevIsFormOpenRef.current = isFormOpen;
  }, [isFormOpen, fetchVentas]);

  useEffect(() => {
    if (clienteSearchTerm.trim() !== "") {
      const filtered = clientesList.filter(cliente => 
        cliente.nombre.toLowerCase().includes(clienteSearchTerm.toLowerCase())
      );
      setFilteredClientes(filtered);
      setShowClienteResults(true);
    } else {
      setFilteredClientes([]);
      setShowClienteResults(false);
    }
  }, [clienteSearchTerm, clientesList]);
  
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredVentas(ventasData);
    } else {
      const filtered = ventasData.filter(venta => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (venta.cliente_nombre && venta.cliente_nombre.toLowerCase().includes(searchLower)) ||
          venta.id.toLowerCase().includes(searchLower) ||
          venta.fecha.toLowerCase().includes(searchLower) ||
          venta.estado.toLowerCase().includes(searchLower) ||
          venta.estado_pago.toLowerCase().includes(searchLower) ||
          venta.total.toString().includes(searchTerm)
        );
      });
      setFilteredVentas(filtered);
    }
  }, [searchTerm, ventasData]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleClienteSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClienteSearchTerm(e.target.value);
  };
  
  const handleClienteSelect = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsClienteEditOpen(true);
    setClienteSearchTerm("");
    setShowClienteResults(false);
  };
  
  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };
  
  const handleDeleteSale = (id: string) => {
    console.log('[Ventas] handleDeleteSale called with id:', id);
    setSaleToDelete(id);
    setIsDeleteDialogOpen(true);
    toast.info(`Intentando eliminar venta ${id.substring(0,8)}...`);
  }
  
  const updateVentaEstadoPago = async (id: string, estado_pago: 'pagado' | 'pendiente') => {
    try {
      const { error } = await supabase
        .from('ventas')
        .update({ estado_pago })
        .eq('id', id);
      
      if (error) throw error;
      
      setVentasData(prev => 
        prev.map(venta => 
          venta.id === id ? { ...venta, estado_pago } : venta
        )
      );
      toast.success(`Estado de pago para venta ${id.substring(0, 8)}... actualizado a ${estado_pago}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Error al actualizar el estado de pago');
    }
  };
  
  const updateVentaEstado = async (id: string, estado: 'completada' | 'pendiente' | 'cancelada' | 'preparacion' | 'listo' | 'entregado') => {
    try {
      const { error } = await supabase
        .from('ventas')
        .update({ estado })
        .eq('id', id);
      
      if (error) throw error;
      
      setVentasData(prev => 
        prev.map(venta => 
          venta.id === id ? { ...venta, estado } : venta
        )
      );
      
      if (estado === 'entregado') {
        const { error: completeError } = await supabase
          .from('ventas')
          .update({ estado: 'completada' })
          .eq('id', id);
        
        if (completeError) throw completeError;
        
        setVentasData(prev => 
          prev.map(venta => 
            venta.id === id ? { ...venta, estado: 'completada' } : venta
          )
        );
      }
      
      toast.success(`Estado de venta ${id.substring(0, 8)}... actualizado a ${estado}`);
    } catch (error) {
      console.error('Error updating sale status:', error);
      toast.error('Error al actualizar el estado de la venta');
    }
  };
  
  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'preparacion': return 'processing';
      case 'listo': return 'ready';
      case 'entregado': return 'delivered';
      case 'completada': return 'success';
      case 'cancelada': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'preparacion': return <ClipboardList className="w-3.5 h-3.5" />;
      case 'listo': return <Package className="w-3.5 h-3.5" />;
      case 'entregado': return <TruckIcon className="w-3.5 h-3.5" />;
      case 'completada': return <CheckCircle className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold pl-12 sm:pl-0">Ventas</h1>
          <Button className="flex items-center gap-2" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva Venta</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>

        {isFormOpen && (
          <VentaForm 
            open={isFormOpen} 
            onOpenChange={(newState) => {
              console.log('Ventas.tsx: VentaForm onOpenChange (Nueva Venta). Nuevo estado:', newState);
              setIsFormOpen(newState);
            }}
          />
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Ventas</CardTitle>
            <CardDescription>
              Administra tus ventas, visualiza detalles y actualiza estados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar ventas..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="relative" ref={clienteSearchRef}>
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar cliente..."
                  className="pl-8"
                  value={clienteSearchTerm}
                  onChange={handleClienteSearch}
                />
                {showClienteResults && filteredClientes.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-card rounded-md border shadow-lg max-h-60 overflow-auto">
                    {filteredClientes.map(cliente => (
                      <div
                        key={cliente.id}
                        className="p-2 hover:bg-accent cursor-pointer"
                        onClick={() => handleClienteSelect(cliente)}
                      >
                        {cliente.nombre}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Cargando ventas...</span>
              </div>
            ) : (
              <div className="block md:hidden space-y-3">
                {filteredVentas.length > 0 ? (
                  filteredVentas.map((venta) => (
                    <div key={venta.id} className="rounded-lg border p-4 flex flex-col gap-1 bg-card">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-lg">{venta.cliente_nombre || "Sin cliente"}</span>
                        <Badge variant={getEstadoBadgeVariant(venta.estado)}>{venta.estado.charAt(0).toUpperCase() + venta.estado.slice(1)}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{venta.fecha}</div>
                      <div className="text-sm">Total: ${venta.total.toFixed(2)}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={venta.estado_pago === "pagado" ? "success" : "warning"}>{venta.estado_pago === "pagado" ? "Pagado" : "Pendiente"}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => {/* aquí podrías abrir el recibo */}}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteSale(venta.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No se encontraron ventas.
                  </div>
                )}
              </div>
            )}
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Cargando ventas...</span>
              </div>
            ) : (
              <div className="hidden md:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[#6ED19E]">Cliente</TableHead>
                      <TableHead className="text-[#6ED19E] hidden md:table-cell">Fecha</TableHead>
                      <TableHead className="text-[#6ED19E] text-right">Total</TableHead>
                      <TableHead className="text-[#6ED19E] text-center">Estado</TableHead>
                      <TableHead className="text-[#6ED19E] text-center">Pago</TableHead>
                      <TableHead className="text-[#6ED19E] text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVentas.length > 0 ? (
                      filteredVentas.flatMap((venta) => [
                        <TableRow key={`row-${venta.id}`}>
                          <TableCell>
                            <Collapsible
                              open={openItems.includes(venta.id)}
                              onOpenChange={() => toggleItem(venta.id)}
                            >
                              <CollapsibleTrigger className="flex h-8 w-8 items-center justify-center rounded-md border">
                                <ChevronDown 
                                  className={`h-4 w-4 transition-transform ${
                                    openItems.includes(venta.id) ? "rotate-180" : ""
                                  }`} 
                                />
                              </CollapsibleTrigger>
                            </Collapsible>
                          </TableCell>
                          <TableCell className="font-medium">{venta.id.substring(0, 8)}...</TableCell>
                          <TableCell>{venta.cliente_nombre}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {venta.fecha ? new Date(venta.fecha).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">${Math.round(venta.total)}</TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="outline"
                                  className="flex items-center gap-1 p-2 h-auto"
                                  size="sm"
                                >
                                  <Badge 
                                    variant={getEstadoBadgeVariant(venta.estado)} 
                                    className="flex items-center gap-1 py-1"
                                  >
                                    {getEstadoIcon(venta.estado)}
                                    <span>{venta.estado.charAt(0).toUpperCase() + venta.estado.slice(1)}</span>
                                  </Badge>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => updateVentaEstado(venta.id, 'preparacion')}>
                                  <ClipboardList className="mr-2 h-4 w-4" />
                                  <span>En preparación</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateVentaEstado(venta.id, 'listo')}>
                                  <Package className="mr-2 h-4 w-4" />
                                  <span>Listo para entrega</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateVentaEstado(venta.id, 'entregado')}>
                                  <TruckIcon className="mr-2 h-4 w-4" />
                                  <span>Entregado</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateVentaEstado(venta.id, 'cancelada')}>
                                  <AlertCircle className="mr-2 h-4 w-4" />
                                  <span>Cancelada</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="outline"
                                  className="flex items-center gap-1 p-2 h-auto"
                                  size="sm"
                                >
                                  <Badge 
                                    variant={venta.estado_pago === "pagado" ? "success" : "warning"} 
                                    className="flex items-center gap-1 py-1"
                                  >
                                    <CreditCard className="h-3.5 w-3.5" />
                                    <span>{venta.estado_pago === "pagado" ? "Pagado" : "Pendiente"}</span>
                                  </Badge>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => updateVentaEstadoPago(venta.id, 'pagado')}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  <span>Marcar como pagado</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateVentaEstadoPago(venta.id, 'pendiente')}>
                                  <Clock className="mr-2 h-4 w-4" />
                                  <span>Marcar como pendiente</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center space-x-1">
                              <SaleReceipt venta={venta} />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDeleteSale(venta.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>,
                        openItems.includes(venta.id) && (
                          <TableRow key={`detail-${venta.id}`}>
                            <TableCell colSpan={8} className="p-0">
                              <div className="p-4 bg-muted/50">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-medium">Detalle de Productos</h4>
                                  <SaleReceipt venta={venta} />
                                </div>
                                <div className="rounded-md border overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="text-[#6ED19E]">Producto</TableHead>
                                        <TableHead className="text-[#6ED19E] text-center">Cantidad</TableHead>
                                        <TableHead className="text-[#6ED19E] text-right">Precio Unit.</TableHead>
                                        <TableHead className="text-[#6ED19E] text-right">Subtotal</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {venta.items?.map((item, i) => (
                                        <TableRow key={`${venta.id}-item-${i}`}>
                                          <TableCell>{item.producto_nombre}</TableCell>
                                          <TableCell className="text-center">{Math.round(item.cantidad)}</TableCell>
                                          <TableCell className="text-right">${Math.round(item.precio_unitario)}</TableCell>
                                          <TableCell className="text-right">${Math.round(item.subtotal)}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      ])
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                          {searchTerm ? 
                            "No se encontraron ventas con los criterios de búsqueda." :
                            "No hay ventas registradas. ¡Regista tu primera venta!"
                          }
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {isFormOpen && (
        <VentaForm 
          open={isFormOpen} // Correcto: usa isFormOpen para el estado open
          onOpenChange={(newState) => { // Correcto: usa setIsFormOpen para manejar el cambio de estado
            console.log('Ventas.tsx: VentaForm onOpenChange (Nueva Venta). Nuevo estado:', newState);
            setIsFormOpen(newState);
          }}
        />
      )}
      
      {/* El bloque conflictivo de VentaForm que estaba aquí (alrededor de 593-603) ha sido eliminado. 
          Si se necesita un formulario para editar selectedVenta, se añadirá correctamente por separado. */}

      {isClienteEditOpen && selectedCliente && (
        <ClienteEditForm
          open={isClienteEditOpen} // Corregido: usar 'open' en lugar de 'isOpen'
          onClose={() => setIsClienteEditOpen(false)}
          cliente={selectedCliente}
          onClienteUpdated={fetchClientes}
        />
      )}
      
      {isDeleteDialogOpen && saleToDelete && (
        <DeleteSaleDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            console.log('[Ventas] DeleteSaleDialog onOpenChange triggered:', open);
            setIsDeleteDialogOpen(open);
            if (!open) {
              setSaleToDelete(null);
              toast.info('Diálogo de eliminación cerrado/cancelado');
            }
          }}
          saleId={saleToDelete}
          onSaleDeleted={() => {
            console.log('[Ventas] onSaleDeleted (fetchVentas) triggered');
            fetchVentas();
            toast.success('fetchVentas ejecutado tras eliminación');
          }}
        />
      )}
    </MainLayout>
  );
};

export default Ventas;
