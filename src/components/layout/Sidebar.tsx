import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Settings,
  Menu,
  X,
  DollarSign,
  LogOut
} from "lucide-react";

import { useAjustesStore } from "@/store/ajustesStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  path,
  active,
}) => {
  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
        "hover:bg-primary/10",
        active
          ? "bg-primary/15 text-[#55F9E3] font-medium"
          : "text-muted-foreground hover:forced-colors:#55F9E3"
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const { nombreSistema } = useAjustesStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Update sidebar state when screen size changes
  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  const sidebarItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
      path: "/",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Clientes",
      path: "/clientes",
    },
    {
      icon: <Package className="h-5 w-5" />,
      label: "Productos",
      path: "/productos",
    },
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      label: "Ventas",
      path: "/ventas",
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      label: "Gastos",
      path: "/gastos",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Ajustes",
      path: "/ajustes",
    },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Sesión cerrada correctamente');
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Overlay oscuro cuando sidebar está abierto en móvil */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
          aria-label="Cerrar menú"
        />
      )}
      <button
        className={cn(
          "fixed top-4 left-4 z-50 md:hidden",
          "p-2 rounded-lg text-muted-foreground",
          "hover:bg-primary/10 hover:text-primary",
          "transition-colors duration-200"
        )}
        onClick={toggleSidebar}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 md:z-10",
          "flex flex-col bg-card/80 backdrop-blur-md",
          "border-r border-border/50",
          "transition-all duration-300 ease-in-out shadow-xl",
          "w-4/5 max-w-xs md:w-64 lg:w-[20%]",
          isMobile
            ? isOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0",
          "md:translate-x-0"
        )}
        tabIndex={-1}
        aria-modal={isMobile && isOpen}
        role="dialog"
      >
        <div className="flex h-16 items-center border-b border-border/50 px-4">
          <div className="flex items-center gap-3 px-2">
            <span className="text-lg font-semibold text-foreground">
              {nombreSistema}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-auto py-4 px-3">
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                active={location.pathname === item.path}
              />
            ))}
          </nav>
        </div>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-500 transition-all duration-200 hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">
              {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
            </span>
          </button>
          
          <div className="p-4 border-t border-border/50 mt-2">
            <p className="text-xs text-muted-foreground">
              © 2025 {nombreSistema}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
