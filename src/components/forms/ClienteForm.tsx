
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";

const formSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: z.string().optional().or(z.literal('')).or(z.literal(null)).refine(
    (val) => !val || val === '' || z.string().email().safeParse(val).success,
    { message: "Correo electrónico inválido" }
  ),
  telefono: z.string().min(8, { message: "Número de teléfono inválido" }),
  direccion: z.string().min(5, { message: "La dirección debe tener al menos 5 caracteres" }),
});

type FormValues = z.infer<typeof formSchema>;

interface ClienteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClienteCreated?: (cliente: Cliente) => void;
  clienteEditar?: Cliente;
}

export function ClienteForm({ open, onOpenChange, onClienteCreated, clienteEditar }: ClienteFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: clienteEditar ? {
      nombre: clienteEditar.nombre || "",
      email: clienteEditar.email || "",
      telefono: clienteEditar.telefono || "",
      direccion: clienteEditar.direccion || "",
    } : {
      nombre: "",
      email: "",
      telefono: "",
      direccion: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  // Actualiza los valores del formulario cuando cambia clienteEditar
  React.useEffect(() => {
    if (clienteEditar) {
      form.reset({
        nombre: clienteEditar.nombre || "",
        email: clienteEditar.email || "",
        telefono: clienteEditar.telefono || "",
        direccion: clienteEditar.direccion || "",
      });
    } else {
      form.reset({
        nombre: "",
        email: "",
        telefono: "",
        direccion: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteEditar]);

  async function onSubmit(data: FormValues) {
    try {
      let clienteResult;

      // Convertir email vacío, nulo o indefinido a null antes de enviar a Supabase
      const emailValue = data.email; // Puede ser string, '', null, o undefined según Zod
      const emailToSend = (emailValue === '' || emailValue === null || emailValue === undefined) ? null : emailValue;

      if (clienteEditar) {
        // Update cliente existente
        const { data: updatedCliente, error } = await supabase
          .from('clientes')
          .update({
            nombre: data.nombre,
            email: emailToSend,
            telefono: data.telefono,
            direccion: data.direccion
          })
          .eq('id', clienteEditar.id)
          .select()
          .single();
        if (error) throw error;
        clienteResult = updatedCliente;
        toast.success("Cliente actualizado correctamente", {
          description: `${data.nombre} ha sido actualizado`,
        });
      } else {
        // Insertar nuevo cliente
        const { data: newCliente, error } = await supabase
          .from('clientes')
          .insert([
            {
              nombre: data.nombre,
              email: emailToSend,
              telefono: data.telefono,
              direccion: data.direccion,
              estado: 'activo' as 'activo',
              total_compras: 0
            }
          ])
          .select()
          .single();
        if (error) throw error;
        clienteResult = newCliente;
        toast.success("Cliente creado correctamente", {
          description: `${data.nombre} ha sido agregado a la lista de clientes`,
        });
      }
      if (clienteResult) {
        const clienteWithFormattedDate: Cliente = {
          ...clienteResult,
          fecha_registro: new Date(clienteResult.fecha_registro).toLocaleDateString(),
          estado: clienteResult.estado as 'activo' | 'inactivo'
        };
        if (onClienteCreated) {
          onClienteCreated(clienteWithFormattedDate);
        }
      }
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creando o actualizando cliente:", error);
      if (error.message && error.message.includes("clientes_email_key")) {
        toast.error("Error al guardar el cliente", {
          description: "El correo electrónico ingresado ya está registrado. Por favor, utilice otro.",
        });
      } else {
        toast.error("Error al guardar el cliente", {
          description: error.message || "Por favor, inténtelo de nuevo",
        });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuevo Cliente</DialogTitle>
          <DialogDescription>
            Complete la información para registrar un nuevo cliente.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="correo@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="(123) 456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Calle, Ciudad, Código Postal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cliente"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
