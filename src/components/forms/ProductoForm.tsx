
import React, { useState } from "react";
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
  FormDescription,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Producto, ProductoCategoria } from "@/types";

const productoFormSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre es requerido" }),
  descripcion: z.string().optional(),
  precio: z.string().refine(value => !isNaN(Number(value)) && Number(value) >= 0, {
    message: "El precio debe ser un número válido mayor o igual a 0",
  }),
  categoria: z.string().min(1, { message: "La categoría es requerida" }),
  stock: z.string().refine(value => !isNaN(parseInt(value)) && parseInt(value) >= 0, {
    message: "El stock debe ser un número entero mayor o igual a 0",
  }),
});

type ProductoFormValues = z.infer<typeof productoFormSchema>;

interface ProductoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductoCreated: (producto: Producto) => void;
}

const CATEGORIAS_FIJAS: ProductoCategoria[] = [
  'milanesas', 
  'pizzas', 
  'salsas', 
  'empanadas', 
  'sorrentinos', 
  'lasañas', 
  'canelones', 
  'tartas', 
  'pastel de papa',
  'otros'
];

export function ProductoForm({ open, onOpenChange, onProductoCreated }: ProductoFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<ProductoFormValues>({
    resolver: zodResolver(productoFormSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      precio: "",
      categoria: "",
      stock: "0",
    },
  });

  async function onSubmit(data: ProductoFormValues) {
    try {
      setIsLoading(true);
      
      const { data: producto, error } = await supabase
        .from('productos')
        .insert({
          nombre: data.nombre,
          descripcion: data.descripcion || null,
          precio: parseInt(data.precio),
          categoria: data.categoria,
          stock: parseInt(data.stock),
          estado: 'activo',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success("Producto creado correctamente");
      
      onProductoCreated({
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        categoria: producto.categoria,
        stock: producto.stock,
        imagen_url: producto.imagen_url,
        estado: producto.estado as 'activo' | 'inactivo',
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast.error("Error al crear el producto", {
        description: error.message || "Por favor, inténtelo de nuevo",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Producto</DialogTitle>
          <DialogDescription>
            Complete los datos del nuevo producto. Click en guardar cuando termine.
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
                    <Input placeholder="Nombre del producto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción del producto" 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="precio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="Precio" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>Ingrese solo números enteros (sin decimales)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="Stock" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIAS_FIJAS.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Producto"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
