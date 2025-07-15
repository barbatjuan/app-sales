
import { supabase } from "@/integrations/supabase/client";
import { clientes, productos, ventas } from "@/data/mockData";
import { toast } from "sonner";

export const importMockData = async () => {
  try {
    // Check if we already have data in Supabase
    const { count: clientesCount, error: clientesError } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true });
    
    if (clientesError) throw clientesError;
    
    // If we already have data, don't import
    if (clientesCount && clientesCount > 0) {
      console.log('Datos ya existentes en Supabase, no es necesario importar.');
      return false;
    }

    // Import clientes
    for (const cliente of clientes) {
      // Format the data to match DB schema
      const clienteData = {
        id: cliente.id,
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono || null,
        direccion: cliente.direccion || null,
        fecha_registro: cliente.fecha_registro,
        total_compras: cliente.total_compras || 0,
        estado: cliente.estado
      };
      
      const { error } = await supabase
        .from('clientes')
        .insert([clienteData]);
      
      if (error) throw error;
    }
    
    // Import productos
    for (const producto of productos) {
      const productoData = {
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion || null,
        precio: producto.precio,
        categoria: producto.categoria || null,
        stock: producto.stock,
        imagen_url: producto.imagen_url || null,
        estado: producto.estado
      };
      
      const { error } = await supabase
        .from('productos')
        .insert([productoData]);
      
      if (error) throw error;
    }
    
    // Import ventas y venta_items
    for (const venta of ventas) {
      const ventaData = {
        id: venta.id,
        cliente_id: venta.cliente_id,
        fecha: venta.fecha,
        total: venta.total,
        estado: venta.estado,
        estado_pago: venta.estado_pago
      };
      
      const { error } = await supabase
        .from('ventas')
        .insert([ventaData]);
      
      if (error) throw error;
      
      // Import items de venta
      if (venta.items && venta.items.length > 0) {
        for (const item of venta.items) {
          const itemData = {
            venta_id: venta.id,
            producto_id: item.producto_id,
            producto_nombre: item.producto_nombre,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            subtotal: item.subtotal
          };
          
          const { error: itemError } = await supabase
            .from('venta_items')
            .insert([itemData]);
          
          if (itemError) throw itemError;
        }
      }
    }
    
    toast.success("Datos iniciales importados correctamente", {
      description: "Ahora tienes datos de ejemplo para trabajar en tu aplicación."
    });
    
    return true;
  } catch (error) {
    console.error("Error importando datos:", error);
    toast.error("Error al importar datos iniciales", {
      description: "Ocurrió un error mientras se importaban los datos de ejemplo."
    });
    return false;
  }
};
