
import React from "react";
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
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeleteSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saleId: string;
  onSaleDeleted: () => void;
}

export function DeleteSaleDialog({
  open,
  onOpenChange,
  saleId,
  onSaleDeleted,
}: DeleteSaleDialogProps) {
  const handleDeleteSale = async () => {
    try {
      // First delete related items
      const { error: itemsError } = await supabase
        .from("venta_items")
        .delete()
        .eq("venta_id", saleId);

      if (itemsError) throw itemsError;

      // Then delete the sale
      const { error } = await supabase
        .from("ventas")
        .delete()
        .eq("id", saleId);

      if (error) throw error;

      toast.success("Venta eliminada correctamente");
      onSaleDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("Error al eliminar la venta:", error);
      toast.error("Error al eliminar la venta");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar venta?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. La venta será eliminada permanentemente
            de la base de datos junto con todos sus detalles.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              variant="destructive" 
              onClick={handleDeleteSale}
            >
              Eliminar
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
