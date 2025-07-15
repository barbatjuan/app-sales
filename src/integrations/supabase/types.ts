export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clientes: {
        Row: {
          direccion: string | null
          email: string
          estado: string | null
          fecha_registro: string | null
          id: string
          nombre: string
          telefono: string | null
          total_compras: number | null
        }
        Insert: {
          direccion?: string | null
          email: string
          estado?: string | null
          fecha_registro?: string | null
          id?: string
          nombre: string
          telefono?: string | null
          total_compras?: number | null
        }
        Update: {
          direccion?: string | null
          email?: string
          estado?: string | null
          fecha_registro?: string | null
          id?: string
          nombre?: string
          telefono?: string | null
          total_compras?: number | null
        }
        Relationships: []
      }
      dashboard_stats: {
        Row: {
          crecimiento_ingresos: number | null
          crecimiento_pedidos_pendientes: number | null
          crecimiento_valor: number | null
          crecimiento_ventas: number | null
          fecha_actualizacion: string | null
          id: string
          ingresos_totales: number | null
          pedidos_pendiente_pago: number | null
          valor_promedio: number | null
          ventas_mes_anterior: number | null
          ventas_ultimo_mes: number | null
        }
        Insert: {
          crecimiento_ingresos?: number | null
          crecimiento_pedidos_pendientes?: number | null
          crecimiento_valor?: number | null
          crecimiento_ventas?: number | null
          fecha_actualizacion?: string | null
          id?: string
          ingresos_totales?: number | null
          pedidos_pendiente_pago?: number | null
          valor_promedio?: number | null
          ventas_mes_anterior?: number | null
          ventas_ultimo_mes?: number | null
        }
        Update: {
          crecimiento_ingresos?: number | null
          crecimiento_pedidos_pendientes?: number | null
          crecimiento_valor?: number | null
          crecimiento_ventas?: number | null
          fecha_actualizacion?: string | null
          id?: string
          ingresos_totales?: number | null
          pedidos_pendiente_pago?: number | null
          valor_promedio?: number | null
          ventas_mes_anterior?: number | null
          ventas_ultimo_mes?: number | null
        }
        Relationships: []
      }
      productos: {
        Row: {
          categoria: string | null
          descripcion: string | null
          estado: string | null
          id: string
          imagen_url: string | null
          nombre: string
          precio: number
          stock: number
        }
        Insert: {
          categoria?: string | null
          descripcion?: string | null
          estado?: string | null
          id?: string
          imagen_url?: string | null
          nombre: string
          precio: number
          stock?: number
        }
        Update: {
          categoria?: string | null
          descripcion?: string | null
          estado?: string | null
          id?: string
          imagen_url?: string | null
          nombre?: string
          precio?: number
          stock?: number
        }
        Relationships: []
      }
      venta_items: {
        Row: {
          cantidad: number
          id: string
          precio_unitario: number
          producto_id: string | null
          producto_nombre: string
          subtotal: number
          venta_id: string | null
        }
        Insert: {
          cantidad: number
          id?: string
          precio_unitario: number
          producto_id?: string | null
          producto_nombre: string
          subtotal: number
          venta_id?: string | null
        }
        Update: {
          cantidad?: number
          id?: string
          precio_unitario?: number
          producto_id?: string | null
          producto_nombre?: string
          subtotal?: number
          venta_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venta_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venta_items_venta_id_fkey"
            columns: ["venta_id"]
            isOneToOne: false
            referencedRelation: "ventas"
            referencedColumns: ["id"]
          },
        ]
      }
      ventas: {
        Row: {
          cliente_id: string | null
          estado: string | null
          estado_pago: string | null
          fecha: string | null
          id: string
          total: number
        }
        Insert: {
          cliente_id?: string | null
          estado?: string | null
          estado_pago?: string | null
          fecha?: string | null
          id?: string
          total?: number
        }
        Update: {
          cliente_id?: string | null
          estado?: string | null
          estado_pago?: string | null
          fecha?: string | null
          id?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "ventas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
