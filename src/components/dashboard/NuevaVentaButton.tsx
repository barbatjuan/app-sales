import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { VentaForm } from "@/components/forms/VentaForm";
import { useNavigate } from "react-router-dom";

interface NuevaVentaButtonProps {
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  showIcon?: boolean;
  showText?: boolean;
  text?: string;
  redirectToVentas?: boolean;
}

const NuevaVentaButton = ({
  variant = "default",
  size = "default",
  showIcon = true,
  showText = true,
  text = "Nueva Venta",
  redirectToVentas = false,
}: NuevaVentaButtonProps) => {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = () => {
    try {
      // SOLUCIÓN RADICAL: Forzar almacenamiento del company_id antes de proceder
      // Este es el mismo enfoque que funciona en la página de Ventas
      const forceStoreCompanyId = () => {
        // Intentar recuperar el ID de empresa del DOM si está disponible
        const companyIdFromDOM = document.querySelector('meta[name="company-id"]')?.getAttribute('content');
        
        if (companyIdFromDOM) {
          console.log("Forzando company ID desde DOM en Dashboard:", companyIdFromDOM);
          localStorage.setItem('forced-company-id', companyIdFromDOM);
        } else {
          // Buscar en cualquier parte donde podamos obtenerlo
          const storedData = localStorage.getItem('user-session');
          if (storedData) {
            try {
              const parsed = JSON.parse(storedData);
              if (parsed?.company_id) {
                localStorage.setItem('forced-company-id', parsed.company_id);
              }
            } catch (e) {}
          }
        }
      };
      
      // Ejecutar inmediatamente sin verificación de autenticación
      forceStoreCompanyId();
    } catch (err) {
      console.error("Error preparando datos para Nueva Venta (Dashboard):", err);
    }

    // Proceder sin verificar autenticación
    if (redirectToVentas) {
      navigate("/ventas", { state: { openVentaForm: true } });
    } else {
      setIsFormOpen(true);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleOpenForm}
        className="flex items-center gap-2 transition-colors duration-200"
        style={{
          backgroundColor: "#6ED19E",
          color: "hsl(221.54deg 48.15% 10.59%)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "#5CC38D";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "#6ED19E";
        }}
      >
        {showIcon && <Plus className="h-4 w-4" />}
        {showText && (
          <>
            <span className="hidden sm:inline">{text}</span>
            {text === "Nueva Venta" && <span className="sm:hidden">Nuevo</span>}
          </>
        )}
      </Button>

      {!redirectToVentas && (
        <VentaForm
          open={isFormOpen}
          onOpenChange={(open) => setIsFormOpen(open)}
        />
      )}
    </>
  );
};

export default NuevaVentaButton;
