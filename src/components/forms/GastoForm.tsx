import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Gasto, CategoriaGasto } from "@/types";
import { useAjustesStore } from "@/store/ajustesStore";

interface GastoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gastoToEdit: Gasto | null;
}

export const GastoForm: React.FC<GastoFormProps> = ({ 
  open, 
  onOpenChange,
  gastoToEdit
}) => {
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState<Date | undefined>(new Date());
  const [categoria, setCategoria] = useState<CategoriaGasto>("otros");
  const [notas, setNotas] = useState("");
  const [recurrente, setRecurrente] = useState(false);
  const [frecuencia, setFrecuencia] = useState<"mensual" | "trimestral" | "anual" | "unico">("mensual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { monedaPredeterminada } = useAjustesStore();
  
  useEffect(() => {
    if (gastoToEdit) {
      setConcepto(gastoToEdit.concepto);
      setMonto(gastoToEdit.monto.toString());
      setFecha(new Date(gastoToEdit.fecha));
      setCategoria(gastoToEdit.categoria);
      setNotas(gastoToEdit.notas || "");
      setRecurrente(gastoToEdit.recurrente);
      setFrecuencia(gastoToEdit.frecuencia || "mensual");
    } else {
      resetForm();
    }
  }, [gastoToEdit, open]);
  
  const resetForm = () => {
    setConcepto("");
    setMonto("");
    setFecha(new Date());
    setCategoria("otros");
    setNotas("");
    setRecurrente(false);
    setFrecuencia("mensual");
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!concepto || !monto || !fecha) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }
    
    try {
      setIsSubmitting(true);

      // Primero obtenemos el company_id del usuario actual
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No hay sesión activa");
        return;
      }
      
      // Obtenemos el company_id desde el perfil del usuario
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', session.user.id)
        .single();
        
      if (profileError || !profileData) {
        console.error("Error al obtener el perfil o company_id:", profileError);
        throw new Error("No se pudo obtener el company_id del usuario");
        return;
      }
      
      const userCompanyId = profileData.company_id;
      console.log("Company ID del usuario en GastoForm:", userCompanyId);
      
      const gastoData = {
        concepto,
        monto: parseFloat(monto),
        fecha: fecha.toISOString(),
        categoria,
        notas: notas || null,
        recurrente,
        frecuencia: recurrente ? frecuencia : null,
        estado: 'activo',
        company_id: userCompanyId // Agregar company_id
      };
      
      try {
        if (gastoToEdit) {
          // Actualizar gasto existente
          const { error } = await supabase
            .from('gastos')
            .update(gastoData)
            .eq('id', gastoToEdit.id) as any;
            
          if (error) throw error;
          
          toast.success("Gasto actualizado correctamente");
        } else {
          // Crear nuevo gasto
          const { error } = await supabase
            .from('gastos')
            .insert([gastoData]) as any;
            
          if (error) throw error;
          
          toast.success("Gasto registrado correctamente");
        }
      } catch (supabaseError: any) {
        // Si el error es porque la tabla no existe, mostrar un mensaje específico
        if (supabaseError.message?.includes('does not exist')) {
          console.error('La tabla gastos no existe en la base de datos');
          toast.error('La tabla de gastos aún no ha sido creada en la base de datos');
        } else {
          throw supabaseError;
        }
      }
      
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error al guardar el gasto:", error);
      toast.error(error.message || "Error al guardar el gasto");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {gastoToEdit ? "Editar Gasto" : "Nuevo Gasto"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="concepto">Concepto <span className="text-destructive">*</span></Label>
              <Input
                id="concepto"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                placeholder="Ej. Pago de alquiler"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monto">Monto <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">
                    {monedaPredeterminada === 'USD' ? '$' : monedaPredeterminada}
                  </span>
                  <Input
                    id="monto"
                    type="number"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="pl-10"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha <span className="text-destructive">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fecha ? (
                        format(fecha, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fecha}
                      onSelect={(date) => setFecha(date)}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select 
                value={categoria} 
                onValueChange={(value) => setCategoria(value as CategoriaGasto)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alquiler">Alquiler</SelectItem>
                  <SelectItem value="servicios">Servicios</SelectItem>
                  <SelectItem value="salarios">Salarios</SelectItem>
                  <SelectItem value="insumos">Insumos</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="impuestos">Impuestos</SelectItem>
                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="transporte">Transporte</SelectItem>
                  <SelectItem value="otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Detalles adicionales sobre este gasto..."
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="recurrente" 
                checked={recurrente}
                onCheckedChange={(checked) => setRecurrente(checked as boolean)}
              />
              <Label htmlFor="recurrente" className="cursor-pointer">
                Gasto recurrente
              </Label>
            </div>
            
            {recurrente && (
              <div className="space-y-2">
                <Label htmlFor="frecuencia">Frecuencia</Label>
                <Select 
                  value={frecuencia} 
                  onValueChange={(value) => setFrecuencia(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensual">Mensual</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                    <SelectItem value="unico">Único</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                gastoToEdit ? "Actualizar" : "Guardar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
