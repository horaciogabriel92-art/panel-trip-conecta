"use client";

import { CheckCircle, Clock, AlertCircle, CreditCard, Calendar, FileText } from "lucide-react";

interface Pago {
  id: string;
  monto: number;
  medio_pago?: string;
  fecha_pago: string;
  observaciones?: string;
  tipo: "inicial" | "adicional";
  comprobante_url?: string;
}

interface HistorialPagosProps {
  precioTotal: number;
  montoPagado: number;
  montoRestante: number;
  tipoPago?: string;
  pagos: Pago[];
}

export default function HistorialPagos({
  precioTotal,
  montoPagado,
  montoRestante,
  tipoPago,
  pagos,
}: HistorialPagosProps) {
  const porcentajePagado = precioTotal > 0 ? Math.min(100, (montoPagado / precioTotal) * 100) : 0;

  const getEstadoBadge = () => {
    if (montoRestante <= 0 || tipoPago === "total") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20">
          <CheckCircle className="w-4 h-4" />
          Pago total
        </span>
      );
    }
    if (tipoPago === "parcial" || montoPagado > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
          <Clock className="w-4 h-4" />
          Pago parcial
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20">
        <AlertCircle className="w-4 h-4" />
        Pendiente
      </span>
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-AR");
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-4">
      {/* Header con estado y progreso */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-400" />
            Historial de pagos
          </h3>
          {getEstadoBadge()}
        </div>

        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">
              Pagado: <span className="text-[var(--foreground)] font-medium">${formatCurrency(montoPagado)}</span>
            </span>
            <span className="text-[var(--muted-foreground)]">
              Total: <span className="text-[var(--foreground)] font-medium">${formatCurrency(precioTotal)}</span>
            </span>
          </div>
          <div className="h-3 bg-[var(--muted)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                montoRestante <= 0 ? "bg-green-500" : "bg-orange-500"
              }`}
              style={{ width: `${porcentajePagado}%` }}
            />
          </div>
          {montoRestante > 0 && (
            <p className="text-sm text-orange-400 font-medium">
              Restante: ${formatCurrency(montoRestante)}
            </p>
          )}
        </div>
      </div>

      {/* Lista de pagos */}
      {pagos.length > 0 ? (
        <div className="space-y-3">
          {pagos.map((pago) => (
            <div
              key={pago.id}
              className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    pago.tipo === "inicial"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-purple-500/20 text-purple-400"
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)]">
                    ${formatCurrency(pago.monto)}
                    <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)] uppercase">
                      {pago.medio_pago?.replace("_", " ") || "Pago"}
                    </span>
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)] mt-1">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(pago.fecha_pago)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--muted)]">
                      {pago.tipo === "inicial" ? "Pago inicial" : "Pago adicional"}
                    </span>
                  </div>
                  {pago.observaciones && (
                    <p className="text-sm text-[var(--muted-foreground)] mt-2 italic">
                      “{pago.observaciones}”
                    </p>
                  )}
                </div>
              </div>

              {pago.comprobante_url && (
                <a
                  href={pago.comprobante_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 whitespace-nowrap"
                >
                  <FileText className="w-4 h-4" />
                  Ver comprobante
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[var(--muted-foreground)] text-sm">
          No hay pagos registrados aún.
        </p>
      )}
    </div>
  );
}
