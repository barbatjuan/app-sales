
import { Cliente, Producto, Venta, DashboardStats, ProductoBajoStock, VentaMensual, DistribucionProductos, ProductoMasVendido, VentaItem } from "@/types";

// Datos de clientes de prueba
export const clientes: Cliente[] = [
  {
    id: "CL-001",
    nombre: "Juan Pérez",
    email: "juan.perez@ejemplo.com",
    telefono: "555-123-4567",
    direccion: "Calle Principal 123, Ciudad",
    fecha_registro: "2023-01-15",
    total_compras: 1250.75,
    estado: "activo"
  },
  {
    id: "CL-002",
    nombre: "María González",
    email: "maria.gonzalez@ejemplo.com",
    telefono: "555-987-6543",
    direccion: "Avenida Central 456, Ciudad",
    fecha_registro: "2023-02-20",
    total_compras: 875.50,
    estado: "activo"
  },
  {
    id: "CL-003",
    nombre: "Carlos Rodríguez",
    email: "carlos.rodriguez@ejemplo.com",
    telefono: "555-789-0123",
    direccion: "Plaza Mayor 789, Ciudad",
    fecha_registro: "2023-03-10",
    total_compras: 2340.25,
    estado: "activo"
  },
  {
    id: "CL-004",
    nombre: "Ana Martínez",
    email: "ana.martinez@ejemplo.com",
    telefono: "555-456-7890",
    direccion: "Calle Secundaria 234, Ciudad",
    fecha_registro: "2023-04-05",
    total_compras: 540.00,
    estado: "inactivo"
  },
  {
    id: "CL-005",
    nombre: "Pedro Sánchez",
    email: "pedro.sanchez@ejemplo.com",
    telefono: "555-234-5678",
    direccion: "Avenida Principal 567, Ciudad",
    fecha_registro: "2023-05-12",
    total_compras: 1780.30,
    estado: "activo"
  }
];

// Datos de productos de prueba
export const productos: Producto[] = [
  {
    id: "PR-001",
    nombre: "Lasagna Clásica",
    descripcion: "Lasagna tradicional con carne y salsa de tomate",
    precio: 12.99,
    categoria: "Platos principales",
    stock: 5,
    imagen_url: "/placeholder.svg",
    estado: "activo"
  },
  {
    id: "PR-002",
    nombre: "Lasagna Vegetariana",
    descripcion: "Lasagna con vegetales frescos y salsa de tomate",
    precio: 11.99,
    categoria: "Platos principales",
    stock: 3,
    imagen_url: "/placeholder.svg",
    estado: "activo"
  },
  {
    id: "PR-003",
    nombre: "Lasagna de Mariscos",
    descripcion: "Lasagna con mariscos y salsa bechamel",
    precio: 15.99,
    categoria: "Platos principales",
    stock: 8,
    imagen_url: "/placeholder.svg",
    estado: "activo"
  },
  {
    id: "PR-004",
    nombre: "Lasagna 4 Quesos",
    descripcion: "Lasagna con mezcla de cuatro quesos diferentes",
    precio: 13.99,
    categoria: "Platos principales",
    stock: 2,
    imagen_url: "/placeholder.svg",
    estado: "activo"
  },
  {
    id: "PR-005",
    nombre: "Pizza Margarita",
    descripcion: "Pizza clásica con tomate, mozzarella y albahaca",
    precio: 9.99,
    categoria: "Platos principales",
    stock: 12,
    imagen_url: "/placeholder.svg",
    estado: "activo"
  },
  {
    id: "PR-006",
    nombre: "Pizza Pepperoni",
    descripcion: "Pizza con pepperoni y queso mozzarella",
    precio: 10.99,
    categoria: "Platos principales",
    stock: 10,
    imagen_url: "/placeholder.svg",
    estado: "activo"
  },
  {
    id: "PR-007",
    nombre: "Calzone de Jamón y Queso",
    descripcion: "Calzone relleno de jamón, queso y champiñones",
    precio: 11.50,
    categoria: "Platos principales",
    stock: 7,
    imagen_url: "/placeholder.svg",
    estado: "activo"
  },
  {
    id: "PR-008",
    nombre: "Ensalada César",
    descripcion: "Ensalada fresca con lechuga, crutones, parmesano y aderezo César",
    precio: 7.99,
    categoria: "Entradas",
    stock: 15,
    imagen_url: "/placeholder.svg",
    estado: "activo"
  }
];

// Datos de ventas de prueba
export const ventas: Venta[] = [
  {
    id: "V-001",
    cliente_id: "CL-001",
    cliente_nombre: "Juan Pérez",
    fecha: "2024-03-15",
    total: 25.98,
    estado: "completada",
    estado_pago: "pagado",
    items: [
      {
        id: "VI-001",
        venta_id: "V-001",
        producto_id: "PR-001",
        producto_nombre: "Lasagna Clásica",
        cantidad: 2,
        precio_unitario: 12.99,
        subtotal: 25.98
      }
    ]
  },
  {
    id: "V-002",
    cliente_id: "CL-002",
    cliente_nombre: "María González",
    fecha: "2024-03-16",
    total: 35.97,
    estado: "completada",
    estado_pago: "pagado",
    items: [
      {
        id: "VI-002",
        venta_id: "V-002",
        producto_id: "PR-002",
        producto_nombre: "Lasagna Vegetariana",
        cantidad: 3,
        precio_unitario: 11.99,
        subtotal: 35.97
      }
    ]
  },
  {
    id: "V-003",
    cliente_id: "CL-003",
    cliente_nombre: "Carlos Rodríguez",
    fecha: "2024-03-18",
    total: 43.97,
    estado: "completada",
    estado_pago: "pagado",
    items: [
      {
        id: "VI-003",
        venta_id: "V-003",
        producto_id: "PR-004",
        producto_nombre: "Lasagna 4 Quesos",
        cantidad: 2,
        precio_unitario: 13.99,
        subtotal: 27.98
      },
      {
        id: "VI-004",
        venta_id: "V-003",
        producto_id: "PR-008",
        producto_nombre: "Ensalada César",
        cantidad: 2,
        precio_unitario: 7.99,
        subtotal: 15.98
      }
    ]
  },
  {
    id: "V-004",
    cliente_id: "CL-005",
    cliente_nombre: "Pedro Sánchez",
    fecha: "2024-03-20",
    total: 28.00,
    estado: "pendiente",
    estado_pago: "pendiente",
    items: [
      {
        id: "VI-005",
        venta_id: "V-004",
        producto_id: "PR-006",
        producto_nombre: "Pizza Pepperoni",
        cantidad: 2,
        precio_unitario: 10.99,
        subtotal: 21.98
      },
      {
        id: "VI-006",
        venta_id: "V-004",
        producto_id: "PR-008",
        producto_nombre: "Ensalada César",
        cantidad: 1,
        precio_unitario: 7.99,
        subtotal: 7.99
      }
    ]
  }
];

// Datos de estadísticas del dashboard
export const dashboardStats: DashboardStats = {
  ingresos_totales: 133.92,
  ventas_ultimo_mes: 4,
  ventas_mes_anterior: 3,
  valor_promedio: 33.48,
  pedidos_pendiente_pago: 28.00,
  crecimiento_ingresos: 12.5,
  crecimiento_ventas: 33.3,
  crecimiento_valor: 2.1,
  crecimiento_pedidos_pendientes: 3.2,
  clientes_nuevos_mes: 5,
  crecimiento_clientes: 25.0
};

// Datos de productos con bajo stock
export const productosBajoStock: ProductoBajoStock[] = [
  {
    id: "PR-004",
    nombre: "Lasagna 4 Quesos",
    stock: 2
  },
  {
    id: "PR-002",
    nombre: "Lasagna Vegetariana",
    stock: 3
  },
  {
    id: "PR-001",
    nombre: "Lasagna Clásica",
    stock: 5
  }
];

// Datos de ventas mensuales
export const ventasMensuales: VentaMensual[] = [
  { mes: "Ene", ventas: 45, pedidos: 5 },
  { mes: "Feb", ventas: 60, pedidos: 8 },
  { mes: "Mar", ventas: 140, pedidos: 12 },
  { mes: "Abr", ventas: 0, pedidos: 0 },
  { mes: "May", ventas: 0, pedidos: 0 },
  { mes: "Jun", ventas: 0, pedidos: 0 },
  { mes: "Jul", ventas: 0, pedidos: 0 },
  { mes: "Ago", ventas: 0, pedidos: 0 },
  { mes: "Sep", ventas: 0, pedidos: 0 },
  { mes: "Oct", ventas: 0, pedidos: 0 },
  { mes: "Nov", ventas: 0, pedidos: 0 },
  { mes: "Dic", ventas: 0, pedidos: 0 }
];

// Datos de distribución de productos
export const distribucionProductos: DistribucionProductos[] = [
  { producto: "Lasagna Clásica", porcentaje: 40, color: "#3B82F6" },
  { producto: "Lasagna Vegetariana", porcentaje: 25, color: "#10B981" },
  { producto: "Lasagna de Mariscos", porcentaje: 20, color: "#F59E0B" },
  { producto: "Lasagna 4 Quesos", porcentaje: 15, color: "#EF4444" }
];

// Datos de productos más vendidos
export const productosMasVendidos: ProductoMasVendido[] = [
  { id: "PR-001", nombre: "Lasagna Clásica", cantidadVendida: 12, porcentaje: 35, color: "#3B82F6" },
  { id: "PR-006", nombre: "Pizza Pepperoni", cantidadVendida: 8, porcentaje: 25, color: "#10B981" },
  { id: "PR-002", nombre: "Lasagna Vegetariana", cantidadVendida: 7, porcentaje: 20, color: "#F59E0B" },
  { id: "PR-004", nombre: "Lasagna 4 Quesos", cantidadVendida: 5, porcentaje: 15, color: "#EF4444" },
  { id: "PR-008", nombre: "Ensalada César", cantidadVendida: 3, porcentaje: 5, color: "#8B5CF6" }
];
