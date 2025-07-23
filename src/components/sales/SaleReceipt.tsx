import React, { useRef } from "react";
import { Venta, VentaItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Printer, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAjustesStore } from "@/store/ajustesStore";
import { useMoneda } from "@/hooks/useMoneda";
import { UnidadDisplay } from "@/components/ui/UnidadDisplay";
import { UnidadTipo } from "@/components/forms/venta/UnidadSelector";

interface SaleReceiptProps {
  venta: Venta;
  trigger?: React.ReactNode;
}

const SaleReceipt = ({ venta, trigger }: SaleReceiptProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { nombreEmpresa } = useAjustesStore();
  const { moneda, formatCurrency } = useMoneda();
  

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor, permite las ventanas emergentes para imprimir");
      return;
    }

    // Add content to the print window
    printWindow.document.write(`
      <html>
        <head>
          <title>Comprobante de Venta - ${venta.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 20px;
              color: #1A1F2C;
              background-color: #f8f9fa;
            }
            .receipt {
              max-width: 800px;
              margin: 0 auto;
              border: 1px solid #e2e8f0;
              padding: 20px;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #f1f5f9;
              padding-bottom: 15px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
              color: #1a1f2c;
            }
            .header p {
              margin-top: 4px;
              color: #64748b;
            }
            .info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .info-item {
              margin-bottom: 10px;
            }
            .info-item strong {
              display: block;
              font-weight: 600;
              color: #334155;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #f1f5f9;
            }
            th {
              background-color: #f8fafc;
              font-weight: 600;
              color: #475569;
            }
            .total {
              text-align: right;
              font-size: 18px;
              font-weight: 700;
              margin-top: 20px;
              padding-top: 15px;
              border-top: 2px solid #f1f5f9;
              color: #1e293b;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #64748b;
              font-size: 14px;
              border-top: 1px solid #f1f5f9;
              padding-top: 15px;
            }
            @media print {
              body {
                padding: 0;
                background-color: #fff;
              }
              .receipt {
                border: none;
                box-shadow: none;
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            ${content.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const customTrigger = trigger || (
    <Button variant="outline" size="sm" className="flex items-center gap-2">
      <Printer className="h-4 w-4" />
      <span>Imprimir</span>
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>{customTrigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comprobante de Venta</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="mb-4 flex justify-end">
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              <span>Imprimir</span>
            </Button>
          </div>

          <div ref={printRef} className="border rounded-md p-6">
            <div className="text-center mb-6 pb-4 border-b">
              <h1 className="text-2xl font-bold">Comprobante de Venta</h1>
              <p>{nombreEmpresa || 'Sistema de Ventas WCoders'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <div className="mb-2">
                  <strong>Cliente:</strong> {venta.cliente_nombre}
                </div>
                <div className="mb-2">
                  <strong>Fecha:</strong> {formatDate(venta.fecha)}
                </div>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  <strong>ID de Venta:</strong> {venta.id}
                </div>
                <div className="mb-2">
                  <strong>Estado:</strong> {venta.estado}
                </div>
                <div className="mb-2">
                  <strong>Estado de pago:</strong>{" "}
                  {venta.estado_pago === 'pagado' ? (
                    <span className="text-success font-medium">Pagado</span>
                  ) : (
                    <span className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-semibold inline-flex">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Pendiente</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <table className="w-full mb-6">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-2 text-left">Producto</th>
                  <th className="px-4 py-2 text-center">Cantidad</th>
                  <th className="px-4 py-2 text-right">Precio Unit.</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {venta.items &&
                  venta.items.map((item: VentaItem, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-3">{item.producto_nombre}</td>
                      <td className="px-4 py-3 text-center">
                        {item.unidad_tipo ? (
                          <UnidadDisplay 
                            cantidad={parseFloat(item.cantidad.toString())} 
                            unidadTipo={item.unidad_tipo as UnidadTipo} 
                            mostrarEquivalencia={true}
                          />
                        ) : (
                          parseFloat(item.cantidad.toString()).toFixed(2)
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(item.precio_unitario)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <div className="text-right text-xl font-bold mt-4 pt-4 border-t">
              <div>Total: {formatCurrency(venta.total)}</div>
            </div>

            <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
              <p>Gracias por su compra</p>
              <p>Este documento sirve como comprobante de entrega</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaleReceipt;
