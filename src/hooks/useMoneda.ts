import { useAjustesStore } from "@/store/ajustesStore";
import { useEffect } from "react";

/**
 * Hook para obtener la moneda que debe usar el usuario actual.
 * Devuelve la moneda específica del usuario si está configurada,
 * o la moneda predeterminada del sistema si no hay preferencia específica.
 */
export function useMoneda() {
  const { 
    monedaPredeterminada, 
    monedaUsuario, 
    fetchUserSettings 
  } = useAjustesStore();

  // Al cargar el componente, buscamos las preferencias del usuario
  useEffect(() => {
    fetchUserSettings();
  }, [fetchUserSettings]);

  // Si el usuario tiene una moneda específica configurada, usamos esa
  // Si no, usamos la moneda predeterminada del sistema
  const monedaActual = monedaUsuario || monedaPredeterminada;
  
  /**
   * Formatea un valor numérico según la moneda actual
   * @param value - El valor a formatear
   * @returns El valor formateado con el símbolo de moneda correspondiente
   */
  const formatCurrency = (value: number | undefined | null): string => {
    const safeValue = value || 0;
    return `${monedaActual === 'USD' ? '$' : monedaActual} ${safeValue.toFixed(2)}`;
  };

  return {
    moneda: monedaActual,
    formatCurrency,
  };
}
