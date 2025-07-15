import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
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
          .refine((value) => !isNaN(parseInt(value)) && parseInt(value) > 0, {
            message: "La cantidad debe ser mayor que 0",
          }),
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
  const [items, setItems] = useState([{ productoId: "", cantidad: "1" }]);
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

  useEffect(() => {
    if (open) {
      fetchClientes();
      fetchProductos();
    }
  }, [open]);

  const fetchClientes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
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
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("estado", "activo")
        .gt("stock", 0);

      if (error) throw error;

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
      items: [{ productoId: "", cantidad: "1" }],
    },
  });

  const updateFormItems = (newItems: { productoId: string; cantidad: string }[]) => {
    form.setValue("items", newItems);
  };

  const checkStock = (data: VentaFormValues): boolean => {
    for (const item of data.items) {
      const producto = productos.find((p) => p.id === item.productoId);
      if (producto) {
        const cantidad = parseInt(item.cantidad);
        if (cantidad > producto.stock) {
          setProductoStockInsuficiente({
            nombre: producto.nombre,
            stock: producto.stock,
          });
          setCantidadSolicitada(cantidad);
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

      // Calculate total
      let total = 0;
      let items = [];

      for (const item of data.items) {
        const producto = productos.find((p) => p.id === item.productoId);
        if (producto) {
          const cantidad = parseInt(item.cantidad);
          const subtotal = producto.precio * cantidad;
          total += subtotal;

          items.push({
            producto_id: item.productoId,
            producto_nombre: producto.nombre,
            cantidad: cantidad,
            precio_unitario: producto.precio,
            subtotal: subtotal,
          });
        }
      }

      // Create sale
      const { data: ventaData, error: ventaError } = await supabase
        .from("ventas")
        .insert({
          cliente_id: data.clienteId,
          fecha: new Date().toISOString(),
          total: total,
          estado: data.estadoVenta,
          estado_pago: data.estadoPago,
        })
        .select()
        .single();

      if (ventaError) throw ventaError;

      // Create sale items
      if (ventaData) {
        const ventaItems = items.map((item) => ({
          ...item,
          venta_id: ventaData.id,
        }));

        const { error: itemsError } = await supabase
          .from("venta_items")
          .insert(ventaItems);

        if (itemsError) throw itemsError;

        // Update product stock
        for (const item of data.items) {
          const producto = productos.find((p) => p.id === item.productoId);
          if (producto) {
            const cantidad = parseInt(item.cantidad);
            const newStock = producto.stock - cantidad;
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
            .update({ total_compras: Math.round(nuevoTotal) })
            .eq("id", data.clienteId);
        }

        toast.success("Venta registrada correctamente", {
          description: `Venta registrada por $${Math.round(total)}`,
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
    } catch (error) {
      console.error("Error procesando venta:", error);
      toast.error("Error al procesar la venta");
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
