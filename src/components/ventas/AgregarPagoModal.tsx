"use client";

import { useState } from "react";
import { X, DollarSign, CreditCard, Calendar, FileText, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface AgregarPagoModalProps {
  ventaId: string;
  cotizacionId: string;
  montoRestante: number;
  onClose: () => void;
  onSuccess: () => void;
}

const MEDIOS_PAGO = [
  { value: "transferencia", label: "Transferencia bancaria" },
  { value: "efectivo", label: "Efectivo" },
  { value: "tarjeta_credito", label: "Tarjeta de crédito" },
  { value: "tarjeta_debito", label: "Tarjeta de débito" },
  { value: "cheque", label: "Cheque" },
  { value: "otro", label: "Otro" },
];

export default function AgregarPagoModal({
  ventaId,
  cotizacionId,
  montoRestante,
  onClose,
  onSuccess,
}: AgregarPagoModalProps) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    monto: "",
    medio_pago: "transferencia",
    fecha_pago: new Date().toISOString().split("T")[0],
    observaciones: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(formData.monto);

    if (!montoNum || montoNum <= 0) {
      toastError("El monto debe ser mayor a 0", "Error");
      return;
    }
    if (montoNum > montoRestante) {
      toastError(`El monto no puede superar el restante ($${montoRestante.toFixed(2)})`, "Error");
      return;
    }

    setIsLoading(true);
    let comprobanteUrl = null;

    try {
      // 1. Subir comprobante si existe
      if (comprobante) {
        const uploadForm = new FormData();
        uploadForm.append("comprobante", comprobante);
        uploadForm.append("descripcion", `Comprobante pago adicional - ${formData.medio_pago}`);
        const uploadRes = await api.post(`/upload/comprobante-pago/${cotizacionId}`, uploadForm);
        comprobanteUrl = uploadRes.data?.comprobante?.url || `/uploads/comprobantes/${uploadRes.data?.comprobante?.nombre_archivo}`;
      }

      // 2. Registrar pago
      await api.post(`/ventas/${ventaId}/pagos`, {
        monto: montoNum,
        medio_pago: formData.medio_pago,
        fecha_pago: formData.fecha_pago,
        observaciones: formData.observaciones,
        comprobante_url: comprobanteUrl,
      });

      toastSuccess("Pago registrado correctamente", "Éxito");
      onSuccess();
    } catch (err: any) {
      console.error("Error registrando pago:", err);
      toastError(err.response?.data?.error || "Error al registrar el pago", "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/image\/(jpeg|png|webp)|application\/pdf/)) {
      toastError("Solo se permiten imágenes (JPG, PNG, WebP) o PDFs", "Archivo inválido");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toastError("El archivo no puede superar los 10MB", "Archivo muy grande");
      return;
    }
    setComprobante(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-[var(--foreground)] mb-1">
          Registrar pago adicional
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-5">
          Restante: <span className="text-orange-400 font-semibold">${montoRestante.toFixed(2)}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Monto */}
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">
              Monto pagado
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input
                type="number"
                step="0.01"
                min={0.01}
                max={montoRestante}
                required
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Medio de pago */}
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">
              Medio de pago
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <select
                value={formData.medio_pago}
                onChange={(e) => setFormData({ ...formData, medio_pago: e.target.value })}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none appearance-none"
              >
                {MEDIOS_PAGO.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fecha de pago */}
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">
              Fecha de pago
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input
                type="date"
                required
                value={formData.fecha_pago}
                onChange={(e) => setFormData({ ...formData, fecha_pago: e.target.value })}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows={3}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Ej: segunda seña, pago parcial..."
            />
          </div>

          {/* Comprobante */}
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">
              Comprobante (opcional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2 text-[var(--foreground)] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>
            {comprobante && (
              <p className="text-xs text-green-400 mt-1">
                Archivo seleccionado: {comprobante.name}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium text-[var(--foreground)] bg-[var(--muted)] hover:bg-[var(--muted)]/80 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Registrar pago"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
