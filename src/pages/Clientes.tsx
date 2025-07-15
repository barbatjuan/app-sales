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
import { Search, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ClienteForm } from "@/components/forms/ClienteForm";
import { Cliente } from "@/types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const Clientes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clienteEditar, setClienteEditar] = useState<Cliente | null>(null);
  const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .order('nombre', { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          // Convert date format for display and ensure correct types
          const formattedData: Cliente[] = data.map(cliente => ({
            ...cliente,
            fecha_registro: new Date(cliente.fecha_registro).toLocaleDateString(),
            estado: cliente.estado as 'activo' | 'inactivo'
          }));
          setClientes(formattedData);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast.error('Error al cargar los clientes');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClientes();
  }, []);
  
  const filteredClientes = clientes.filter(
    (cliente) => 
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const clientesPaginados = filteredClientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleClienteCreated = async (cliente: Cliente) => {
    setClientes(prev => {
      const existe = prev.find(c => c.id === cliente.id);
      if (existe) {
        // Actualiza el cliente editado
        return prev.map(c => c.id === cliente.id ? cliente : c);
      } else {
        // Agrega nuevo cliente
        return [...prev, cliente];
      }
    });
    setIsFormOpen(false);
    setClienteEditar(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6 pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold pl-12 sm:pl-0">Clientes</h1>
          <Button className="flex items-center gap-2" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Nuevo Cliente</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gestión de Clientes</CardTitle>
            <CardDescription>
              Administra la información de tus clientes y sus compras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Vista tipo lista en móvil, tabla en md+ */}
            <div className="block md:hidden space-y-3">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredClientes.length > 0 ? (
                filteredClientes.map((cliente) => (
                  <div key={cliente.id} className="rounded-lg border p-4 flex flex-col gap-1 bg-card">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">{cliente.nombre}</span>
                      <Badge variant="brand">
                        {cliente.estado.charAt(0).toUpperCase() + cliente.estado.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{cliente.email}</div>
                    <div className="text-sm">Tel: {cliente.telefono}</div>
                    <div className="text-xs text-muted-foreground">Registrado: {cliente.fecha_registro}</div>
                    <div className="text-sm font-medium">Compras: ${cliente.total_compras.toFixed(2)}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No se encontraron clientes con los criterios de búsqueda.
                </div>
              )}
            </div>
            <div className="hidden md:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* ID oculto en móvil, visible solo en md+ */}
                    <TableHead className="hidden md:table-cell text-[#6ED19E]">ID</TableHead>
                    <TableHead className="text-[#6ED19E]">Nombre</TableHead>
                    <TableHead className="text-[#6ED19E]">Email</TableHead>
                    <TableHead className="text-[#6ED19E]">Teléfono</TableHead>
                    <TableHead className="hidden md:table-cell text-[#6ED19E]">Fecha de Registro</TableHead>
                    <TableHead className="text-right text-[#6ED19E]">Total Compras</TableHead>
                    
                    <TableHead className="text-center text-[#6ED19E]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex justify-center items-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : clientesPaginados.length > 0 ? (
                    clientesPaginados.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium hidden md:table-cell">
                          {cliente.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{cliente.nombre}</TableCell>
                        <TableCell>{cliente.email}</TableCell>
                        <TableCell>{cliente.telefono}</TableCell>
                        <TableCell className="hidden md:table-cell">{cliente.fecha_registro}</TableCell>
                        <TableCell className="text-right">${cliente.total_compras.toFixed(2)}</TableCell>
                        
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
  size="sm"
  className="bg-[#ff9e64] text-[#1a1b26] rounded-full px-3 py-1 text-xs font-semibold border-none transition-colors duration-200 hover:bg-[#e07d2b] focus:bg-[#e07d2b]"
  onClick={() => {
    setClienteEditar(cliente);
    setIsFormOpen(true);
  }}
>
  Editar
</Button>
                            <Button
  size="sm"
  className="bg-[#e31452] text-[#1a1b26] rounded-full px-3 py-1 text-xs font-semibold border-none transition-colors duration-200 hover:bg-[#c90e47] focus:bg-[#c90e47]"
  onClick={() => {
    setClienteAEliminar(cliente);
    setIsDeleteDialogOpen(true);
  }}
>
  Eliminar
</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        <div>No se encontraron clientes con los criterios de búsqueda.</div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Controles de paginación fuera de la tabla */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                  Anterior
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                  Siguiente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ClienteForm open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) setClienteEditar(null);
      }} onClienteCreated={handleClienteCreated} clienteEditar={clienteEditar || undefined} />

      {/* Diálogo de confirmación de borrado */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar cliente</DialogTitle>
          </DialogHeader>
          <p>¿Estás seguro de que deseas eliminar a <b>{clienteAEliminar?.nombre}</b>? Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={async () => {
              if (!clienteAEliminar) return;
              try {
                const { error } = await supabase.from('clientes').delete().eq('id', clienteAEliminar.id);
                if (error) throw error;
                setClientes(prev => prev.filter(c => c.id !== clienteAEliminar.id));
                toast.success("Cliente eliminado correctamente");
              } catch (err: any) {
                toast.error("Error al eliminar el cliente", { description: err.message });
              } finally {
                setIsDeleteDialogOpen(false);
                setClienteAEliminar(null);
              }
            }}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Clientes;
