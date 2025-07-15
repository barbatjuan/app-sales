import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client'; // Importamos el cliente de Supabase

export interface AjustesState {
  // Ajustes generales
  nombreSistema: string;
  monedaPredeterminada: string;
  zonaHoraria: string;

  // Perfil de usuario
  nombreUsuario: string;
  apellidoUsuario: string;
  emailUsuario: string;

  // Información de empresa
  nombreEmpresa: string;
  direccionEmpresa: string;
  telefonoEmpresa: string;
  sitioWebEmpresa: string;

  // Configuración de pagos
  porcentajeImpuesto: string;
  metodoPagoPredeterminado: string;

  // Métodos para actualizar los ajustes
  actualizarAjustesGenerales: (ajustes: Partial<AjustesGenerales>) => void;
  actualizarPerfilUsuario: (perfil: Partial<PerfilUsuario>) => void;
  actualizarInformacionEmpresa: (empresa: Partial<InformacionEmpresa>) => void;
  actualizarConfiguracionPagos: (pagos: Partial<ConfiguracionPagos>) => void;
  fetchCompanyInfo: () => Promise<void>; // Nueva función para obtener datos de la empresa
}

interface AjustesGenerales {
  nombreSistema: string;
  monedaPredeterminada: string;
  zonaHoraria: string;
}

interface PerfilUsuario {
  nombreUsuario: string;
  apellidoUsuario: string;
  emailUsuario: string;
}

interface InformacionEmpresa {
  nombreEmpresa: string;
  direccionEmpresa: string;
  telefonoEmpresa: string;
  sitioWebEmpresa: string;
}

interface ConfiguracionPagos {
  porcentajeImpuesto: string;
  metodoPagoPredeterminado: string;
}

export const useAjustesStore = create<AjustesState>()(
  persist(
    (set) => ({
      // Valores iniciales
      nombreSistema: "WCoders SaaS",
      monedaPredeterminada: "UYU",
      zonaHoraria: "UTC-3",
      
      nombreUsuario: "Admin",
      apellidoUsuario: "Usuario",
      emailUsuario: "admin@ejemplo.com",
      
      nombreEmpresa: "WCoders SaaS Inc.",
      direccionEmpresa: "Calle Principal 123, Ciudad",
      telefonoEmpresa: "+1 234 567 890",
      sitioWebEmpresa: "www.wcoders.com",
      
      porcentajeImpuesto: "16%",
      metodoPagoPredeterminado: "Tarjeta de crédito",
      
      // Métodos para actualizar
      actualizarAjustesGenerales: (ajustes) => set((state) => ({ ...state, ...ajustes })),
      actualizarPerfilUsuario: (perfil) => set((state) => ({ ...state, ...perfil })),
      actualizarInformacionEmpresa: (empresa) => set((state) => ({ ...state, ...empresa })),
      actualizarConfiguracionPagos: (pagos) => set((state) => ({ ...state, ...pagos })),

      // Nueva función para obtener y actualizar la información de la empresa desde Supabase
      fetchCompanyInfo: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Gracias a RLS, esta consulta solo devolverá la empresa del usuario actual.
          const { data: company, error } = await supabase
            .from('companies')
            .select('name, logo_url') // Pedimos el nombre y el logo
            .single();

          if (error) {
            console.error('Error fetching company info:', error);
            return;
          }

          if (company) {
            set({ 
              nombreEmpresa: company.name || 'Sin Nombre',
              // Aquí podrías añadir más campos si los necesitas, como el logo.
              // sitioWebEmpresa: company.logo_url || '' 
            });
          }
        }
      },
    }),
    {
      name: 'ajustes-storage',
    }
  )
);
