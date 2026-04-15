"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import { Mail, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSent(true);
        toastSuccess("Instrucciones enviadas", "Revisá tu bandeja de entrada");
      } else {
        toastError(data.error || "Error al enviar solicitud", "Error");
      }
    } catch (err) {
      toastError("Error de conexión", "No se pudo contactar al servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 bg-[var(--background)]">
      <div className="gradient-bg" />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-3xl p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              Recuperar contraseña
            </h2>
            <p className="text-[var(--muted-foreground)] text-sm">
              Ingresá tu email y te enviaremos un link para restablecerla.
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <Send className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-[var(--foreground)]">
                Si el email existe en nuestro sistema, recibirás instrucciones en breve.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)] ml-1">
                  Correo electrónico
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3.5 
                             text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] 
                             focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 
                             transition-all"
                    required
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
                  <span>Enviar link de recuperación</span>
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
    </div>
  );
}
