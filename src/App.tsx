
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAjustesStore } from "@/store/ajustesStore";
import { importMockData } from "@/utils/dataImport";
import AuthRoute from "@/components/auth/AuthRoute";

// Páginas
import Dashboard from "@/pages/Dashboard";
import Clientes from "@/pages/Clientes";
import Productos from "@/pages/Productos";
import Ventas from "@/pages/Ventas";
import Gastos from "@/pages/Gastos";
import Ajustes from "@/pages/Ajustes";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";

const queryClient = new QueryClient();

const App = () => {
  const fetchCompanyInfo = useAjustesStore((state) => state.fetchCompanyInfo);

  useEffect(() => {
    // Verificar si hay una sesión existente al cargar la aplicación
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Sesión existente detectada, obteniendo datos de la empresa...');
        fetchCompanyInfo();
      }
    };
    
    // Ejecutar la verificación de sesión inmediatamente
    checkExistingSession();
    
    // Listener para cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('Usuario ha iniciado sesión, obteniendo datos de la empresa...');
        fetchCompanyInfo();
      }
    });

    // Intentar importar datos solo una vez al inicio de la aplicación (si aún es necesario)
    importMockData();

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchCompanyInfo]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Login route - public */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <AuthRoute>
                <Dashboard />
              </AuthRoute>
            } />
            <Route path="/clientes" element={
              <AuthRoute>
                <Clientes />
              </AuthRoute>
            } />
            <Route path="/productos" element={
              <AuthRoute>
                <Productos />
              </AuthRoute>
            } />
            <Route path="/ventas" element={
              <AuthRoute>
                <Ventas />
              </AuthRoute>
            } />
            <Route path="/gastos" element={
              <AuthRoute>
                <Gastos />
              </AuthRoute>
            } />
            <Route path="/ajustes" element={
              <AuthRoute>
                <Ajustes />
              </AuthRoute>
            } />
            
            {/* Redirect index to dashboard */}
            <Route path="/index" element={<Navigate to="/" replace />} />
            
            {/* Not found page */}
            <Route path="*" element={
              <AuthRoute>
                <NotFound />
              </AuthRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
