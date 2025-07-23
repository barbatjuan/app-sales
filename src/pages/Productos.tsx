
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
import { Search, Plus, Package, Loader2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductoForm } from "@/components/forms/ProductoForm";
import { ProductoEditForm } from "@/components/forms/ProductoEditForm";
import { Producto } from "@/types";
import { toast } from "sonner";
import { useMoneda } from "@/hooks/useMoneda";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const Productos: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { formatCurrency } = useMoneda();
  
  useEffect(() => {
    fetchProductos();
  }, []);
  
  const fetchProductos = async () => {
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
      console.log("Company ID del usuario en Productos:", userCompanyId);
      
      // Ahora consultamos los productos filtrando por company_id y estado activo
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('company_id', userCompanyId) // Filtrar por company_id
        .eq('estado', 'activo') // Solo productos activos
        .order('nombre', { ascending: true });
          
      if (error) throw error;
      
      if (data) {
        const typedData: Producto[] = data.map(producto => ({
          ...producto,
          estado: producto.estado as 'activo' | 'inactivo'
        }));
        setProductos(typedData);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar los productos');
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredProductos = productos.filter(
    (producto) => 
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      producto.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
  const productosPaginados = filteredProductos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleProductoCreated = (newProducto: Producto) => {
    setProductos(prev => [...prev, newProducto]);
    setIsFormOpen(false);
  };

  const handleEditProducto = (producto: Producto) => {
    setSelectedProducto(producto);
    setIsEditFormOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6 pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold pl-12 sm:pl-0">Productos</h1>
          <Button className="flex items-center gap-2" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Nuevo Producto</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Catálogo de Productos</CardTitle>
            <CardDescription>
              Administra tu inventario y precios de productos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o categoría..."
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
              ) : filteredProductos.length > 0 ? (
                filteredProductos.map((producto) => (
                  <div key={producto.id} className="rounded-lg border p-4 flex flex-col gap-1 bg-card">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center">
                        <Package className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-lg">{producto.nombre}</span>
                      <Badge 
                        variant="brand"
                        className="ml-auto"
                      >
                        {producto.estado.charAt(0).toUpperCase() + producto.estado.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{producto.categoria || "Sin categoría"}</div>
                    <div className="text-sm">Stock: <span className={
                      producto.stock <= 2 
                        ? "text-destructive font-bold" 
                        : producto.stock <= 5 
                          ? "text-warning font-bold" 
                          : ""
                    }>{producto.stock}</span></div>
                    <div className="text-sm">Precio: {formatCurrency(producto.precio)}</div>
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProducto(producto)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No se encontraron productos con los criterios de búsqueda.
                </div>
              )}
            </div>
            <div className="hidden md:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[#6ED19E]">Nombre</TableHead>
                    <TableHead className="hidden md:table-cell text-[#6ED19E]">Categoría</TableHead>
                    <TableHead className="text-right text-[#6ED19E]">Precio</TableHead>
                    <TableHead className="text-center text-[#6ED19E]">Stock</TableHead>
                    <TableHead className="text-center text-[#6ED19E]">Estado</TableHead>
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
                  ) : productosPaginados.length > 0 ? (
                    productosPaginados.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center">
                              <Package className="h-5 w-5" />
                            </div>
                            <div className="font-medium">{producto.nombre}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {producto.categoria ? (
                            <Badge variant="category">{producto.categoria}</Badge>
                          ) : (
                            <span className="text-muted-foreground">No definida</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(producto.precio)}</TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={producto.stock <= 5 ? "outline" : "secondary"}
                            className={
                              producto.stock <= 2 
                                ? "text-destructive border-destructive" 
                                : producto.stock <= 5 
                                  ? "text-warning border-warning" 
                                  : ""
                            }
                          >
                            {producto.stock}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="brand"
                          >
                            {producto.estado.charAt(0).toUpperCase() + producto.estado.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProducto(producto)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setProductoAEliminar(producto);
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
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        <div>No se encontraron productos con los criterios de búsqueda.</div>
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

      <ProductoForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onProductoCreated={handleProductoCreated} 
      />

      <ProductoEditForm
        open={isEditFormOpen}
        onOpenChange={setIsEditFormOpen}
        producto={selectedProducto}
        onProductoUpdated={fetchProductos}
      />
      {/* Diálogo de confirmación de borrado */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar producto</DialogTitle>
          </DialogHeader>
          <p>¿Estás seguro de que deseas eliminar <b>{productoAEliminar?.nombre}</b>? Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={async () => {
              if (!productoAEliminar) return;
              try {
                // Intentar eliminación física primero
                const { error: deleteError } = await supabase.from('productos').delete().eq('id', productoAEliminar.id);
                
                if (deleteError) {
                  // Si falla por restricción de clave foránea, hacer borrado lógico
                  if (deleteError.message.includes('foreign key constraint') || deleteError.message.includes('violates')) {
                    const { error: updateError } = await supabase
                      .from('productos')
                      .update({ estado: 'inactivo' })
                      .eq('id', productoAEliminar.id);
                    
                    if (updateError) throw updateError;
                    
                    // Actualizar el estado local del producto
                    setProductos(prev => prev.map(p => 
                      p.id === productoAEliminar.id ? { ...p, estado: 'inactivo' as const } : p
                    ));
                    
                    toast.success("Producto desactivado correctamente", {
                      description: "El producto se marcó como inactivo porque está siendo usado en ventas existentes."
                    });
                  } else {
                    throw deleteError;
                  }
                } else {
                  // Eliminación física exitosa
                  setProductos(prev => prev.filter(p => p.id !== productoAEliminar.id));
                  toast.success("Producto eliminado correctamente");
                }
              } catch (err: any) {
                toast.error("Error al eliminar el producto", { description: err.message });
              } finally {
                setIsDeleteDialogOpen(false);
                setProductoAEliminar(null);
              }
            }}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Productos;
