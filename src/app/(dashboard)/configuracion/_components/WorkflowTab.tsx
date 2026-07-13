"use client";

import { useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { useWorkflowMode, WorkflowMode } from "@/hooks/useWorkflowMode";
import { configAPI } from "@/lib/api-config";
import {
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lock,
  UserCog,
  UserCheck,
  Zap,
} from "lucide-react";

const MODES: {
  key: WorkflowMode;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    key: "admin_confirma",
    label: "Admin confirma",
    description:
      "Cada cotización requiere aprobación explícita de un administrador antes de convertirse en venta.",
    icon: UserCog,
  },
  {
    key: "vendedor_autoconfirma",
    label: "Vendedor autoconfirma",
    description:
      "Los vendedores pueden convertir sus cotizaciones en ventas sin esperar aprobación del administrador.",
    icon: UserCheck,
  },
  {
    key: "simple",
    label: "Simple",
    description:
      "Flujo directo sin etapas de aprobación. Ideal para operaciones pequeñas o planes iniciales.",
    icon: Zap,
  },
];

export default function WorkflowTab() {
  const { tenant } = useTenant();
  const { mode, isSimple, canVendedorAutoconfirmar } = useWorkflowMode();
  const [selected, setSelected] = useState<WorkflowMode>(mode);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSelect = async (newMode: WorkflowMode) => {
    if (newMode === selected) return;
    if (newMode === "vendedor_autoconfirma" && !canVendedorAutoconfirmar) return;

    setSelected(newMode);
    setIsSaving(true);
    setMessage(null);

    try {
      await configAPI.actualizarConfiguracionTenant({
        workflow: { mode: newMode },
      });
      setMessage({ type: "success", text: "Metodología de trabajo actualizada" });
      window.location.reload();
    } catch (error: any) {
      console.error("Error actualizando metodología de trabajo:", error);
      setSelected(mode);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Error al actualizar la metodología de trabajo",
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
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          Metodología de trabajo
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Define cómo fluyen las cotizaciones antes de convertirse en ventas.
        </p>

        {isSimple && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-400 flex items-start gap-2">
            <Lock className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Tu plan actual usa el modo <strong>Simple</strong>. Para habilitar los modos de
              aprobación, actualiza a un plan Pro Agencia o Pro Ilimitado.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODES.filter((m) => (isSimple ? m.key === "simple" : m.key !== "simple")).map((m) => {
            const isActive = mode === m.key;
            const isDisabled =
              isSaving || (m.key === "vendedor_autoconfirma" && !canVendedorAutoconfirmar);
            const Icon = m.icon;

            return (
              <button
                key={m.key}
                type="button"
                onClick={() => handleSelect(m.key)}
                disabled={isDisabled}
                className={`relative text-left p-5 rounded-xl border transition-all ${
                  isActive
                    ? "bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/40"
                    : "bg-[var(--muted)] border-[var(--border)] hover:border-purple-500/30"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? "bg-purple-500/20 text-purple-400" : "bg-[var(--card)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--foreground)]">{m.label}</span>
                      {isActive && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                          Activo
                        </span>
                      )}
                      {m.key === "vendedor_autoconfirma" && !canVendedorAutoconfirmar && (
                        <span className="text-[10px] flex items-center gap-1 text-[var(--muted-foreground)]">
                          <Lock className="w-3 h-3" />
                          Plan Pro
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">{m.description}</p>
                  </div>
                </div>
                {isSaving && isActive && (
                  <Loader2 className="absolute top-3 right-3 w-4 h-4 animate-spin text-purple-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
