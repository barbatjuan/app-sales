export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  fecha_registro: string;
  total_compras: number | null;
  estado: 'activo' | 'inactivo';
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number; // Precio base (por unidad)
  precio_unidad?: number; // Precio específico por unidad
  precio_media_docena?: number; // Precio por media docena (6 unidades)
  precio_docena?: number; // Precio por docena (12 unidades)
  categoria: string | null;
  stock: number;
  imagen_url: string | null;
  estado: 'activo' | 'inactivo';
}

export interface Venta {
  id: string;
  cliente_id: string | null;
  cliente_nombre?: string; // Added for join data
  fecha: string | null;
  total: number;
  estado: 'completada' | 'pendiente' | 'cancelada' | 'preparacion' | 'listo' | 'entregado';
  estado_pago: 'pagado' | 'pendiente';
  items?: VentaItem[]; // Optional for listing vs. detailed view
}

export interface VentaItem {
  id: string;
  venta_id: string | null;
  producto_id: string | null;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export type ProductoCategoria = 
  | 'milanesas' 
  | 'pizzas' 
  | 'salsas' 
  | 'empanadas' 
  | 'sorrentinos' 
  | 'lasañas' 
  | 'canelones' 
  | 'tartas' 
  | 'pastel de papa'
  | 'otros';

export interface DashboardStats {
  ingresos_totales: number;
  ventas_ultimo_mes: number;
  ventas_mes_anterior: number;
  valor_promedio: number;
  pedidos_pendiente_pago: number;
  cantidad_ventas_pendientes: number;
  total_pedidos_pendientes: number;
  crecimiento_ingresos: number;
  crecimiento_ventas: number;
  crecimiento_valor: number;
  crecimiento_pedidos_pendientes: number;
  porcentaje_pedidos_pendientes: number;
  porcentaje_cantidad_ventas_pendientes_change: number;
  clientes_nuevos_mes: number;
  crecimiento_clientes: number;
  gastos_mes_actual: number;
  gastos_mes_anterior: number;
  crecimiento_gastos: number;
  beneficios_mes_actual: number;
  beneficios_mes_anterior: number;
  crecimiento_beneficios: number;
}

export type CategoriaGasto = 
  | 'alquiler'
  | 'servicios'
  | 'salarios'
  | 'insumos'
  | 'marketing'
  | 'impuestos'
  | 'mantenimiento'
  | 'transporte'
  | 'otros';

export interface Gasto {
  id: string;
  concepto: string;
  monto: number;
  fecha: string;
  categoria: CategoriaGasto;
  notas?: string;
  comprobante?: string;
  recurrente: boolean;
  frecuencia?: 'mensual' | 'trimestral' | 'anual' | 'unico';
  estado: 'activo' | 'anulado';
  created_at?: string;
  updated_at?: string;
}

export interface ProductoBajoStock {
  id: string;
  nombre: string;
  stock: number;
}

export interface VentaMensual {
  mes: string;
  ventas: number;
  pedidos: number;
}

export interface DistribucionProductos {
  producto: string;
  porcentaje: number;
  color: string;
}

export interface ProductoMasVendido {
  id: string;
  nombre: string;
  cantidadVendida: number;
  porcentaje: number;
  color: string;
}

export interface ProductoMenosVendido {
  id: string;
  nombre: string;
  cantidadVendida: number;
  porcentaje: number;
  color: string;
}
