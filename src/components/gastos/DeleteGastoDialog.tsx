import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DeleteGastoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gastoId: string;
  onGastoDeleted: () => void;
}

export const DeleteGastoDialog: React.FC<DeleteGastoDialogProps> = ({
  open,
  onOpenChange,
  gastoId,
  onGastoDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      try {
        // En lugar de eliminar, marcamos como anulado
        const { error } = await supabase
          .from('gastos')
          .update({ estado: 'anulado' })
          .eq('id', gastoId) as any;
          
        if (error) throw error;
        
        toast.success("Gasto anulado correctamente");
        onGastoDeleted();
        onOpenChange(false);
      } catch (supabaseError: any) {
        // Si el error es porque la tabla no existe, mostrar un mensaje específico
        if (supabaseError.message?.includes('does not exist')) {
          console.error('La tabla gastos no existe en la base de datos');
          toast.error('La tabla de gastos aún no ha sido creada en la base de datos');
          onOpenChange(false);
        } else {
          throw supabaseError;
        }
      }
    } catch (error: any) {
      console.error("Error al anular el gasto:", error);
      toast.error(error.message || "Error al anular el gasto");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción anulará el gasto seleccionado. Los gastos anulados no se contabilizarán en los reportes financieros.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Anulando...
              </>
            ) : (
              "Anular Gasto"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
