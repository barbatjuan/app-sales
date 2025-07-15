import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Settings,
  Menu,
  X,
  DollarSign
} from "lucide-react";

import { useAjustesStore } from "@/store/ajustesStore";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const { nombreSistema } = useAjustesStore();

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
            <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
  <img
    src="/logo juano.png"
    alt="Logo Juano Cocina Gourmet"
    style={{ display: 'block', textAlign: 'center', marginTop: 32, marginBottom: 8, width: 100, height: 100, objectFit: 'contain' }}
  />
</div>
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

        <div className="p-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            © 2025 {nombreSistema}
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
