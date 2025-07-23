import React from "react";
import { nombreUnidades, UnidadTipo } from "../forms/venta/UnidadSelector";

interface UnidadDisplayProps {
  cantidad: number;
  unidadTipo: UnidadTipo;
  className?: string;
  mostrarEquivalencia?: boolean;
}

export function UnidadDisplay({ 
  cantidad, 
  unidadTipo, 
  className = "", 
  mostrarEquivalencia = false 
}: UnidadDisplayProps) {
  const formatNumero = (num: number): string => {
    // Si el número es entero, mostrar sin decimales
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  const nombreUnidad = nombreUnidades[unidadTipo] || "Unidad";
  
  return (
    <span className={className}>
      {formatNumero(cantidad)} {nombreUnidad}
      {mostrarEquivalencia && unidadTipo !== "unidad" && (
        <span className="text-muted-foreground text-xs ml-1">
          ({formatNumero(cantidad)} {nombreUnidad.toLowerCase()} = {formatNumero(cantidad * (unidadTipo === "docena" ? 12 : unidadTipo === "media_docena" ? 6 : 1))} unidades)
        </span>
      )}
    </span>
  );
}
