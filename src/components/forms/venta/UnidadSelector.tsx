import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type UnidadTipo = "unidad" | "docena" | "media_docena" | "kilo" | "medio_kilo";

export const factorConversion: Record<UnidadTipo, number> = {
  unidad: 1,
  docena: 12,
  media_docena: 6,
  kilo: 1,
  medio_kilo: 0.5
};

export const nombreUnidades: Record<UnidadTipo, string> = {
  unidad: "Unidad",
  docena: "Docena",
  media_docena: "Media docena",
  kilo: "Kilo",
  medio_kilo: "Medio kilo"
};

interface UnidadSelectorProps {
  unidadSeleccionada: UnidadTipo;
  onChange: (unidad: UnidadTipo) => void;
  categoria?: string | null;
}

export function UnidadSelector({ unidadSeleccionada, onChange, categoria }: UnidadSelectorProps) {
  // Decidir qué unidades mostrar basado en la categoría del producto
  const getUnidadesDisponibles = (): UnidadTipo[] => {
    // Unidades básicas que siempre estarán disponibles
    const unidadesBasicas: UnidadTipo[] = ["unidad", "media_docena", "docena"];
    
    // Si no hay categoría, solo mostramos las unidades básicas
    if (!categoria) return unidadesBasicas;
    
    // Dependiendo de la categoría, añadimos otras unidades específicas
    switch (categoria.toLowerCase()) {
      case "salsas":
      case "pastel de papa":
        return [...unidadesBasicas, "kilo", "medio_kilo"];
      default:
        return unidadesBasicas;
    }
  };

  const unidadesDisponibles = getUnidadesDisponibles();

  return (
    <Select 
      value={unidadSeleccionada} 
      onValueChange={(value: UnidadTipo) => onChange(value)}
    >
      <SelectTrigger className="w-[110px]">
        <SelectValue placeholder="Unidad" />
      </SelectTrigger>
      <SelectContent>
        {unidadesDisponibles.map((unidad) => (
          <SelectItem key={unidad} value={unidad}>
            {nombreUnidades[unidad]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
