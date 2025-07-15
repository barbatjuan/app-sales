
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
import { Printer } from "lucide-react";
import { Venta } from "@/types";
import SaleReceipt from "./SaleReceipt";

interface FinalizeSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  venta?: Venta;
}

export function FinalizeSaleDialog({
  open,
  onOpenChange,
  onConfirm,
  venta,
}: FinalizeSaleDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Finalizar venta</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Está seguro que desea finalizar esta venta? Una vez finalizada, no podrá modificarla.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          
          {venta && (
            <SaleReceipt 
              venta={venta} 
              trigger={
                <Button variant="outline" className="flex items-center gap-2 sm:mr-2">
                  <Printer className="h-4 w-4" />
                  <span>Vista previa</span>
                </Button>
              }
            />
          )}
          
          <AlertDialogAction asChild>
            <Button onClick={handleConfirm}>
              Finalizar venta
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
