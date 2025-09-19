import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useMoneda } from "@/hooks/useMoneda";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Cliente, Producto } from "@/types";
import { StockConfirmationDialog } from "./StockConfirmationDialog";
import { FinalizeSaleDialog } from "@/components/sales/FinalizeSaleDialog";
import { ClienteSearch } from "./venta/ClienteSearch";
import { ProductosSection } from "./venta/ProductosSection";
import { UnidadTipo, factorConversion } from "./venta/UnidadSelector";

const ventaFormSchema = z.object({
  clienteId: z.string().min(1, { message: "Seleccione un cliente" }),
  estadoPago: z.enum(["pagado", "pendiente"]),
  estadoVenta: z.enum(["pendiente", "preparacion", "listo"]),
  items: z
    .array(
      z.object({
        productoId: z.string().min(1, { message: "Seleccione un producto" }),
        cantidad: z
          .string()
          .refine((value) => !isNaN(parseFloat(value)) && parseFloat(value) > 0, {
            message: "La cantidad debe ser mayor que 0",
          }),
        unidadTipo: z.enum(["unidad", "docena", "media_docena", "kilo", "medio_kilo"]).default("unidad"),
      })
    )
    .min(1, { message: "Agregue al menos un producto" }),
});

type VentaFormValues = z.infer<typeof ventaFormSchema>;

interface VentaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VentaForm({ open, onOpenChange }: VentaFormProps) {
  const [items, setItems] = useState([{ productoId: "", cantidad: "1", unidadTipo: "unidad" as UnidadTipo, precioUnitario: "", subtotal: "" }]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [productoStockInsuficiente, setProductoStockInsuficiente] = useState<{
    nombre: string;
    stock: number;
  } | null>(null);
  const [cantidadSolicitada, setCantidadSolicitada] = useState(0);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isFinalizeSaleDialogOpen, setIsFinalizeSaleDialogOpen] =
    useState(false);
  const [submissionData, setSubmissionData] = useState<VentaFormValues | null>(
    null
  );
  const [total, setTotal] = useState(0);

  const { formatCurrency, moneda } = useMoneda();

  useEffect(() => {
    if (open) {
      fetchClientes();
      fetchProductos();
    }
  }, [open]);

  const fetchClientes = async () => {
    try {
      setIsLoading(true);
      
      // SEGURIDAD: Solo usar company_id del usuario autenticado
      const getCompanyId = async () => {
        try {
          // 1. Obtener sesión actual (fuente confiable)
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          
          if (data?.session) {
            // Obtener company_id del perfil del usuario autenticado
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('company_id')
              .eq('id', data.session.user.id)
              .single();
            
            if (profileError) throw profileError;
            
            if (profileData?.company_id) {
              console.log("Company ID del usuario autenticado:", profileData.company_id);
              return profileData.company_id;
            }
          }
          
          // 2. Fallback: intentar obtener de localStorage solo si coincide con usuario autenticado
          try {
            const savedSession = localStorage.getItem('user-session');
            if (savedSession && data?.session) {
              const parsed = JSON.parse(savedSession);
              if (parsed?.company_id) {
                // Validar que el localStorage no esté comprometido
                const { data: validateProfile } = await supabase
                  .from('profiles')
                  .select('company_id')
                  .eq('id', data.session.user.id)
                  .single();
                
                if (validateProfile?.company_id === parsed.company_id) {
                  return parsed.company_id;
                }
              }
            }
          } catch (e) {
            console.warn("Error validando localStorage:", e);
          }
          
          throw new Error("No se pudo obtener company_id del usuario autenticado");
        } catch (err) {
          console.error("Error en getCompanyId:", err);
          return null;
        }
      };
      
      const userCompanyId = await getCompanyId();
      if (!userCompanyId) {
        toast.error("Error al obtener información de la empresa del usuario");
        return;
      }
      
      console.log("Company ID del usuario en VentaForm (clientes):", userCompanyId);

      // Consultar clientes con el company_id obtenido
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("company_id", userCompanyId) // Filtrar por company_id
        .eq("estado", "activo");

      if (error) throw error;

      if (data) {
        const typedData: Cliente[] = data.map((cliente) => ({
          ...cliente,
          estado: cliente.estado as "activo" | "inactivo",
        }));
        setClientes(typedData);
      }
    } catch (error) {
      console.error("Error fetching clientes:", error);
      toast.error("Error al cargar los clientes");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductos = async () => {
    try {
      setIsLoading(true);

      // SEGURIDAD: Solo usar company_id del usuario autenticado
      let userCompanyId = null;
      
      try {
        // Verificar sesión activa
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          throw new Error("Error al obtener sesión: " + sessionError.message);
        }
        
        if (sessionData?.session) {
          // Obtener company_id del perfil del usuario autenticado
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("company_id")
            .eq("id", sessionData.session.user.id)
            .single();

          if (profileError) {
            throw new Error("Error al obtener perfil: " + profileError.message);
          }

          if (profileData?.company_id) {
            userCompanyId = profileData.company_id;
            console.log("Company ID del usuario autenticado (productos):", userCompanyId);
          } else {
            throw new Error("No se encontró company_id en el perfil del usuario");
          }
        } else {
          throw new Error("No hay sesión activa");
        }
      } catch (error) {
        console.error("Error obteniendo company_id seguro:", error);
        toast.error("Error de autenticación al cargar productos");
        return;
      }

      // Si no tenemos company_id válido, no podemos continuar
      if (!userCompanyId) {
        console.error("No se pudo obtener company_id del usuario autenticado");
        toast.error("Error al cargar productos: usuario no autenticado");
        return;
      }

      // Consultar productos con el company_id obtenido
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("company_id", userCompanyId)
        .eq("estado", "activo");

      if (error) {
        console.error("Error al cargar productos:", error);
        toast.error("Error al cargar productos");
        return;
      }

      if (data) {
        const typedData: Producto[] = data.map((producto) => ({
          ...producto,
          estado: producto.estado as "activo" | "inactivo",
        }));
        setProductos(typedData);
      }
    } catch (error) {
      console.error("Error fetching productos:", error);
      toast.error("Error al cargar los productos");
    } finally {
      setIsLoading(false);
    }
  };

  const form = useForm<VentaFormValues>({
    resolver: zodResolver(ventaFormSchema),
    defaultValues: {
      clienteId: "",
      estadoPago: "pendiente",
      estadoVenta: "pendiente",
      items: [{ productoId: "", cantidad: "1", unidadTipo: "unidad", precioUnitario: "", subtotal: "" }],
    },
  });

  const updateFormItems = (
    items: { productoId: string; cantidad: string; unidadTipo: UnidadTipo; precioUnitario?: string; subtotal?: string }[],
    updatedIndex?: number,
    updatedField?: string
  ) => {
    form.setValue("items", items);

    // Recalcular el total siempre que haya cambios
    let nuevoTotal = 0;

    items.forEach((item) => {
      if (item.productoId) {
        // Si hay subtotal editado manualmente, usarlo
        if (item.subtotal && parseFloat(item.subtotal) > 0) {
          nuevoTotal += parseFloat(item.subtotal || "0");
        } else {
          // Calcular subtotal automáticamente
          const producto = productos.find((p) => p.id === item.productoId);
          if (producto) {
            const cantidadNumerica = parseFloat(item.cantidad || "0");
            const precioUnitario = parseFloat(item.precioUnitario || producto.precio.toString());
            nuevoTotal += precioUnitario * cantidadNumerica;
          }
        }
      }
    });

    setTotal(parseFloat(nuevoTotal.toFixed(2)));
  };

  const checkStock = (data: VentaFormValues): boolean => {
    // Verificar stock antes de procesar la venta
    for (const item of data.items) {
      const producto = productos.find((p) => p.id === item.productoId);
      if (producto) {
        // Calcular la cantidad real considerando el tipo de unidad
        const cantidadNumerica = parseFloat(item.cantidad);
        const factorUnidad = factorConversion[item.unidadTipo]; // Ej: docena = 12, unidad = 1
        const cantidadReal = cantidadNumerica * factorUnidad;
        
        if (cantidadReal > producto.stock) {
          // Mostrar mensaje con detalle de la conversión
          const mensajeUnidad = item.unidadTipo !== 'unidad' ? 
            ` (${cantidadNumerica} ${item.unidadTipo} equivale a ${cantidadReal} unidades)` : '';
          
          setProductoStockInsuficiente({
            nombre: producto.nombre,
            stock: producto.stock,
          });
          setCantidadSolicitada(cantidadReal);
          setIsStockDialogOpen(true);
          return false;
        }
      }
    }
    return true;
  };

  const handleConfirmStockInsuficiente = () => {
    setIsStockDialogOpen(false);
    if (submissionData) {
      procesarVenta(submissionData);
    }
  };

  const handleSubmit = (data: VentaFormValues) => {
    setSubmissionData(data);
    if (checkStock(data)) {
      setIsFinalizeSaleDialogOpen(true);
    }
  };

  const confirmFinalizeSale = () => {
    setIsFinalizeSaleDialogOpen(false);
    if (submissionData) {
      procesarVenta(submissionData);
    }
  };

  const procesarVenta = async (data: VentaFormValues) => {
    try {
      setIsLoading(true);

      // SEGURIDAD: Solo usar company_id del usuario autenticado
      let userCompanyId = null;

      // Obtener company_id del usuario autenticado únicamente
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          throw new Error("Error al obtener sesión: " + sessionError.message);
        }
        
        if (sessionData?.session) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("company_id")
            .eq("id", sessionData.session.user.id)
            .single();

          if (profileError) {
            throw new Error("Error al obtener perfil: " + profileError.message);
          }

          if (profileData?.company_id) {
            userCompanyId = profileData.company_id;
            console.log("Company ID del usuario autenticado (crear venta):", userCompanyId);
          } else {
            throw new Error("No se encontró company_id en el perfil del usuario");
          }
        } else {
          throw new Error("No hay sesión activa");
        }
      } catch (error) {
        console.error("Error obteniendo company_id para crear venta:", error);
        toast.error("Error de autenticación al crear venta");
        return;
      }

      // Si no tenemos company_id válido, no podemos continuar
      if (!userCompanyId) {
        console.error("No se pudo obtener company_id del usuario autenticado para crear venta");
        toast.error("Error de autenticación al crear venta");
        return;
      }

      // Calculate total
      let total = 0;
      let ventaItems = [];

      for (const item of data.items) {
        const producto = productos.find((p) => p.id === item.productoId);
        if (producto) {
          const cantidad = parseFloat(item.cantidad);
          const precioUnitario = parseFloat(item.precioUnitario || producto.precio.toString());
          const factor = factorConversion[item.unidadTipo] || 1;
          const cantidadEnUnidades = cantidad * factor;
          const subtotal = precioUnitario * cantidadEnUnidades;
          
          total += subtotal;

          // Crear item de venta con campos válidos del esquema
          ventaItems.push({
            producto_id: item.productoId,
            producto_nombre: producto.nombre,
            cantidad: cantidadEnUnidades,
            precio_unitario: precioUnitario,
            subtotal: parseFloat(subtotal.toFixed(2))
          });
        }
      }

      // Create sale
      // Asegurar una moneda válida incluso si el hook aún no cargó preferencias
      const currencyToStore = (moneda && typeof moneda === 'string' && moneda.trim() !== '') ? moneda : 'UYU';
      const { data: ventaData, error: ventaError } = await supabase
        .from("ventas")
        .insert({
          cliente_id: data.clienteId,
          fecha: new Date().toISOString(),
          total: total,
          estado: data.estadoVenta,
          estado_pago: data.estadoPago,
          company_id: userCompanyId, // Añadir company_id
          currency: currencyToStore, // Almacenar la moneda del usuario con fallback
        })
        .select()
        .single();

      if (ventaError) throw ventaError;

      // Create sale items
      if (ventaData) {
        const itemsToInsert = ventaItems.map((item) => ({
          ...item,
          venta_id: ventaData.id,
        }));

        const { error: itemsError } = await supabase
          .from("venta_items")
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        // Update product stock
        // Actualizar stock teniendo en cuenta las unidades agrupadas
        for (const item of data.items) {
          const producto = productos.find((p) => p.id === item.productoId);
          if (producto) {
            // Calcular la cantidad real considerando el tipo de unidad
            const cantidadNumerica = parseFloat(item.cantidad);
            const factorUnidad = factorConversion[item.unidadTipo]; // Ej: docena = 12, unidad = 1
            const cantidadReal = cantidadNumerica * factorUnidad;
            
            console.log(`Actualizando stock para ${producto.nombre}: ${cantidadNumerica} ${item.unidadTipo} = ${cantidadReal} unidades`);
            
            const newStock = producto.stock - cantidadReal;
            await supabase
              .from("productos")
              .update({ stock: newStock >= 0 ? newStock : 0 })
              .eq("id", item.productoId);
          }
        }

        // Update client total purchases
        const cliente = clientes.find((c) => c.id === data.clienteId);
        if (cliente) {
          const nuevoTotal = (cliente.total_compras || 0) + total;
          await supabase
            .from("clientes")
            .update({ total_compras: parseFloat(nuevoTotal.toFixed(2)) })
            .eq("id", data.clienteId);
        }

        toast.success("Venta registrada correctamente", {
          description: `Venta registrada por ${formatCurrency(total)}`,
        });

        // Reset form
        form.reset({
          clienteId: "",
          estadoPago: "pendiente",
          estadoVenta: "pendiente",
          items: [{ productoId: "", cantidad: "1" }],
        });
        setItems([{ productoId: "", cantidad: "1" }]);
        onOpenChange(false);
      }
    } catch (error: any) {
      // Mejorar el logging para entender errores 400 de Supabase
      if (error && typeof error === 'object') {
        const { message, details, hint, code } = error;
        console.error("Error procesando venta:", { message, details, hint, code, raw: error });
        toast.error(message || "Error al procesar la venta");
      } else {
        console.error("Error procesando venta:", error);
        toast.error("Error al procesar la venta");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onOpenChange={(dialogNewState) => {
          console.log('VentaForm.tsx: Dialog onOpenChange. Nuevo estado:', dialogNewState);
          onOpenChange(dialogNewState); 
        }}
      >
        <DialogContent
          className="p-2 sm:p-6 md:p-8 rounded-2xl w-[90vw] max-w-full h-[90vh] max-h-[90vh] md:w-[50vw] md:max-w-3xl overflow-y-auto flex flex-col justify-start"
        >
          <DialogHeader>
            <DialogTitle>Nueva Venta</DialogTitle>
            <DialogDescription>
              Complete los datos para registrar una nueva venta.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clienteId"
                    render={({ field }) => (
                      <ClienteSearch
                        clientes={clientes}
                        value={field.value}
                        onChange={field.onChange}
                        error={form.formState.errors.clienteId?.message}
                      />
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="estadoPago"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado de Pago</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado de pago" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pagado">Pagado</SelectItem>
                              <SelectItem value="pendiente">
                                Pendiente de Pago
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estadoVenta"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado del Pedido</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado del pedido" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pendiente">Pendiente</SelectItem>
                              <SelectItem value="preparacion">
                                En Preparación
                              </SelectItem>
                              <SelectItem value="listo">Listo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <ProductosSection
                  items={items}
                  productos={productos}
                  setItems={setItems}
                  updateFormItems={updateFormItems}
                  errors={form.formState.errors}
                  setTotal={setTotal}
                />

                <DialogFooter className="mt-auto pt-4">
                  <Button
                    type="button"
                    variant="destructive" // Estilo destructivo para el botón Cancelar
                    onClick={() => {
                      console.log('VentaForm.tsx: Botón Cancelar clickeado. Llamando onOpenChange(false)');
                      onOpenChange(false);
                    }} 
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "#6ED19E",
                      color: "hsl(221.54deg 48.15% 10.59%)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.backgroundColor = "#5CC38D";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.backgroundColor = "#6ED19E";
                      }
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Finalizar Venta"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
      {productoStockInsuficiente && (
        <StockConfirmationDialog
          open={isStockDialogOpen}
          onOpenChange={setIsStockDialogOpen}
          producto={productoStockInsuficiente}
          cantidadSolicitada={cantidadSolicitada}
          onConfirm={handleConfirmStockInsuficiente}
        />
      )}
      <FinalizeSaleDialog
        open={isFinalizeSaleDialogOpen}
        onOpenChange={setIsFinalizeSaleDialogOpen}
        onConfirm={confirmFinalizeSale}
      />
    </>
  );
}
