
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

interface StockConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producto: {
    nombre: string;
    stock: number;
  };
  cantidadSolicitada: number;
  onConfirm: () => void;
}

export function StockConfirmationDialog({
  open,
  onOpenChange,
  producto,
  cantidadSolicitada,
  onConfirm,
}: StockConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Stock insuficiente</AlertDialogTitle>
          <AlertDialogDescription>
            El producto <strong>{producto.nombre}</strong> solo tiene <strong>{producto.stock}</strong> unidades 
            disponibles, pero se han solicitado <strong>{cantidadSolicitada}</strong> unidades.
            <br /><br />
            ¿Desea continuar con la venta de todas formas?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Continuar de todas formas
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
