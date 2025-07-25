import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client'; // Importamos el cliente de Supabase

export interface AjustesState {
  // Ajustes generales
  nombreSistema: string;
  monedaPredeterminada: string; // Moneda global (default del sistema)
  zonaHoraria: string;

  // Perfil de usuario
  nombreUsuario: string;
  apellidoUsuario: string;
  emailUsuario: string;
  
  // Moneda específica del usuario actual
  monedaUsuario: string;

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
  actualizarMonedaUsuario: (moneda: string) => void; // Nueva función para actualizar moneda por usuario
  fetchCompanyInfo: () => Promise<void>; // Función para obtener datos de la empresa
  fetchUserSettings: () => Promise<void>; // Nueva función para obtener configuración del usuario
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
      monedaPredeterminada: "UYU", // Valor por defecto del sistema
      monedaUsuario: "",           // Moneda específica del usuario (vacío = usar la predeterminada)
      zonaHoraria: "UTC-3",
      
      nombreUsuario: "Admin",
      apellidoUsuario: "Usuario",
      emailUsuario: "admin@ejemplo.com",
      
      nombreEmpresa: '', // Valor por defecto
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
      actualizarMonedaUsuario: (moneda) => set({ monedaUsuario: moneda }),

      // Nueva función para obtener y actualizar la información de la empresa desde Supabase
      // Función para obtener configuración específica del usuario actual
      fetchUserSettings: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.warn('No hay usuario autenticado para obtener preferencias');
            return;
          }
          
          // Obtener preferencias del usuario desde la tabla user_preferences
          const { data, error } = await supabase
            .from('user_preferences')
            .select('currency')
            .eq('user_id', user.id)
            .single();
          
          if (error) {
            if (error.code === 'PGRST116') { // No se encontró ningún registro
              console.log('No se encontraron preferencias para este usuario, usando valores predeterminados');
              return;
            }
            console.error('Error al obtener preferencias del usuario:', error);
            return;
          }
          
          if (data && data.currency) {
            // Actualizar la moneda específica del usuario
            set({ monedaUsuario: data.currency });
            console.log(`Moneda del usuario establecida a: ${data.currency}`);
          }
        } catch (error) {
          console.error('Error al obtener configuración de usuario:', error);
        }
      },
      
      fetchCompanyInfo: async () => {
        try {
          // Primero intentamos obtener datos guardados localmente si existen
          const userSession = localStorage.getItem('user-session');
          if (userSession) {
            try {
              const parsedSession = JSON.parse(userSession);
              if (parsedSession?.company_name) {
                // Si tenemos datos en localStorage, los usamos inmediatamente
                set({ 
                  nombreEmpresa: parsedSession.company_name || 'Mi Empresa',
                });
              }
            } catch (err) {
              console.warn("Error al leer datos de empresa de localStorage", err);
            }
          }
          
          // Luego intentamos obtener datos actualizados de la API
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.warn('No hay usuario autenticado para obtener datos de empresa');
            return;
          }

          // Obtenemos el perfil primero para asegurar que tenemos el company_id
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();
            
          if (profileError) {
            console.warn('Error al obtener el perfil:', profileError);
            return;
          }

          if (!profileData?.company_id) {
            console.warn('No se encontró company_id en el perfil');
            return;
          }

          // Ahora consultamos la compañía con el company_id específico
          const { data: company, error } = await supabase
            .from('companies')
            .select('name, logo_url')
            .eq('id', profileData.company_id)
            .single();

          if (error) {
            console.error('Error fetching company info:', error);
            return;
          }

          if (company) {
            // Guardar en localStorage para tener respaldo
            try {
              localStorage.setItem('user-session', JSON.stringify({
                ...JSON.parse(localStorage.getItem('user-session') || '{}'),
                company_name: company.name || 'Mi Empresa'
              }));
            } catch (err) {
              console.warn("Error al guardar datos de empresa en localStorage", err);
            }
            
            set({ 
              nombreEmpresa: company.name || 'Sin Nombre',
            });
          }
        } catch (error) {
          console.error('Error general en fetchCompanyInfo:', error);
          // En caso de error, establecemos un valor por defecto para evitar UI vacía
          set({ nombreEmpresa: 'Sistema de Ventas' });
        }
      },
    }),
    {
      name: 'ajustes-storage',
    }
  )
);
