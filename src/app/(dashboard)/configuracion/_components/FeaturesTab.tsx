"use client";

import { useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { useFeature } from "@/hooks/useFeature";
import { configAPI } from "@/lib/api-config";
import { Wallet, Loader2, CheckCircle, AlertCircle, Lock } from "lucide-react";

export default function FeaturesTab() {
  const { tenant } = useTenant();
  const { enabled, allowed, disabledByPlan } = useFeature("comisiones");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleToggleComisiones = async () => {
    if (!allowed) return;

    setIsSaving(true);
    setMessage(null);

    try {
      await configAPI.actualizarConfiguracionTenant({
        features: {
          comisiones: { enabled: !enabled },
        },
      });
      setMessage({
        type: "success",
        text: enabled ? "Comisiones desactivadas correctamente" : "Comisiones activadas correctamente",
      });
      // Recargar la página para refrescar TenantContext
      window.location.reload();
    } catch (error: any) {
      console.error("Error actualizando configuración:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Error al actualizar la configuración",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-xl ${
            message.type === "success"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-orange-400" />
          Módulos disponibles
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[var(--foreground)]">Comisiones</span>
                {!allowed && (
                  <span className="text-xs flex items-center gap-1 text-[var(--muted-foreground)]">
                    <Lock className="w-3 h-3" />
                    Disponible en planes Pro
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                {allowed
                  ? "Permite gestionar y pagar comisiones a los vendedores."
                  : "Actualiza a un plan Pro Agencia o Pro Ilimitado para habilitar comisiones."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleComisiones}
              disabled={!allowed || isSaving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed ${
                enabled ? "bg-orange-500" : "bg-[var(--border)]"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
              {isSaving && (
                <Loader2 className="absolute inset-0 m-auto w-3 h-3 animate-spin text-[var(--foreground)]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
