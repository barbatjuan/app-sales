
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthRouteProps {
  children: React.ReactNode;
}

const AuthRoute = ({ children }: AuthRouteProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const location = useLocation();

  // Esta función comprueba si tenemos información de sesión guardada en localStorage
  // Si existe, significa que previamente estuvimos autenticados
  const hasSavedSessionInfo = () => {
    try {
      const userSession = localStorage.getItem('user-session');
      if (userSession) {
        const parsedSession = JSON.parse(userSession);
        return !!parsedSession?.company_id;
      }
    } catch (err) {
      console.error("Error al verificar datos de sesión en localStorage:", err);
    }
    return false;
  };

  useEffect(() => {
    // Función para obtener la sesión inicial
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error al obtener sesión inicial:', error);
          // No redireccionar en caso de error
        } else {
          setSession(data.session);
        }
      } catch (error) {
        console.error('Excepción al obtener sesión inicial:', error);
        // No redireccionar en caso de excepción
      } finally {
        setLoading(false);
        setInitialCheckDone(true);
      }
    };

    getSession();

    // Suscripción a cambios de estado de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      console.log("Cambio en estado de autenticación:", _event);
      setSession(currentSession);
      
      if (!currentSession && _event === 'SIGNED_OUT') {
        // Si es un cierre de sesión explícito, limpiamos localStorage
        localStorage.removeItem('user-session');
      }
      
      setLoading(false);
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  // Verificamos si estamos en rutas especiales
  const isVentasRoute = location.pathname === '/ventas';
  const isAjustesRoute = location.pathname === '/ajustes';
  
  // Tenemos tres condiciones para evitar redirecciones
  const allowContinueWithoutSession = 
    // 1. Si estamos en la página de ventas (caso especial)
    isVentasRoute || 
    // 2. Si tenemos información guardada en localStorage (previamente autenticados)
    hasSavedSessionInfo() ||
    // 3. No hemos terminado la verificación inicial
    !initialCheckDone;

  // Solo redireccionamos si no hay sesión Y no es una ruta especial
  if (!session && !allowContinueWithoutSession) {
    console.log("Redireccionando a login desde AuthRoute");
    toast.error('Sesión expirada o no válida');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthRoute;
