"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toastError("Token inválido o expirado", "Error");
      return;
    }
    if (password.length < 6) {
      toastError("La contraseña debe tener al menos 6 caracteres", "Error");
      return;
    }
    if (password !== confirm) {
      toastError("Las contraseñas no coinciden", "Error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        setDone(true);
        toastSuccess("Contraseña actualizada", "Ya podés iniciar sesión");
      } else {
        toastError(data.error || "No se pudo restablecer la contraseña", "Error");
      }
    } catch (err) {
      toastError("Error de conexión", "No se pudo contactar al servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card rounded-3xl p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Nueva contraseña
          </h2>
          <p className="text-[var(--muted-foreground)] text-sm">
            Elegí una contraseña segura para tu cuenta.
          </p>
        </div>

        {!token ? (
          <div className="text-center space-y-4">
            <p className="text-red-400">El link es inválido o ha expirado.</p>
            <Link
              href="/login/forgot-password"
              className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline"
            >
              Solicitar un nuevo link
            </Link>
          </div>
        ) : done ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-[var(--foreground)]">
              Tu contraseña se actualizó correctamente.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Ir al login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)] ml-1">
                Nueva contraseña
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3.5 
                           text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] 
                           focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 
                           transition-all"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)] ml-1">
                Repetir contraseña
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3.5 
                           text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] 
                           focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 
                           transition-all"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                <span>Guardar nueva contraseña</span>
              )}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al login
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 bg-[var(--background)]">
      <div className="gradient-bg" />
      <Suspense fallback={
        <div className="relative z-10 w-full max-w-md">
          <div className="glass-card rounded-3xl p-8 text-center text-[var(--muted-foreground)]">
            Cargando...
          </div>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
