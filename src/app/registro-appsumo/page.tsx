"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Plane,
  Building2,
  User,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface TokenValidation {
  valid: boolean;
  tier: number;
  plan_slug: string;
  plan_name: string;
}

const PLAN_NAMES: Record<number, string> = {
  1: "Freelance",
  2: "Pro Agencia",
  3: "Pro Ilimitado",
};

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function RegistrationForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [validation, setValidation] = useState<TokenValidation | null>(null);
  const [validating, setValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [nombreAgencia, setNombreAgencia] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  const router = useRouter();
  const { login } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  useEffect(() => {
    if (!token) {
      setValidationError("El enlace no contiene un token de activación.");
      setValidating(false);
      return;
    }

    fetch(`${API_URL}/appsumo/validate-token?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Token inválido o expirado");
        }
        return res.json();
      })
      .then((data: TokenValidation) => {
        setValidation(data);
      })
      .catch((err) => {
        setValidationError(err.message || "No pudimos validar tu enlace.");
      })
      .finally(() => {
        setValidating(false);
      });
  }, [token]);

  useEffect(() => {
    const base = normalizeSlug(nombreAgencia);
    if (base) {
      const suffix = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      setSlug(`${base}-${suffix}`);
    } else {
      setSlug("");
    }
  }, [nombreAgencia]);

  const handleSlugChange = (value: string) => {
    setSlug(normalizeSlug(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!nombreAgencia || !slug || !email || !password || !nombre || !apellido) {
      toastError("Completá todos los campos obligatorios.", "Faltan datos");
      return;
    }

    if (password.length < 8) {
      toastError("La contraseña debe tener al menos 8 caracteres.", "Contraseña débil");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      toastError("El slug solo puede contener letras minúsculas, números y guiones.", "Slug inválido");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/appsumo/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          nombre_agencia: nombreAgencia,
          slug,
          email,
          password,
          nombre,
          apellido,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toastSuccess("¡Tu agencia fue creada con éxito!", "Bienvenido a Quotix");
        login(data.token, data.user);
      } else {
        toastError(data.error || "Ocurrió un error al crear tu cuenta.", "Error");
      }
    } catch (error) {
      console.error("Error activando AppSumo:", error);
      toastError("Error al conectar con el servidor.", "Error");
    } finally {
      setIsLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">Verificando tu licencia AppSumo…</p>
        </div>
      </div>
    );
  }

  if (validationError || !validation) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
            Enlace inválido
          </h2>
          <p className="text-[var(--muted-foreground)] mb-6">
            {validationError || "No pudimos validar tu licencia. Volvé a iniciar el proceso desde AppSumo."}
          </p>
          <button
            onClick={() => router.push("/login")}
            className="btn-primary w-full py-3"
          >
            Ir al login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12 bg-[var(--background)]">
      <div className="gradient-bg" />

      <div className="relative z-10 w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-lg mb-2">
              <Plane className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
            Activá tu licencia AppSumo
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Completá el formulario para crear tu agencia en Quotix.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card rounded-3xl p-8 relative"
        >
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-50" />

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Plan seleccionado
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {validation.plan_name || PLAN_NAMES[validation.tier] || "Freelance"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)] ml-1">
                Nombre de tu agencia
              </label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
                <input
                  type="text"
                  value={nombreAgencia}
                  onChange={(e) => setNombreAgencia(e.target.value)}
                  placeholder="Ej: Viajes del Sur"
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3.5 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)] ml-1">
                URL de tu panel
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] text-sm">
                  panel.tripconecta.com/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="tu-agencia"
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-44 pr-4 py-3.5 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                  required
                />
              </div>
              <p className="text-xs text-[var(--muted-foreground)] ml-1">
                Solo letras minúsculas, números y guiones.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)] ml-1">
                  Nombre
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3.5 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)] ml-1">
                  Apellido
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
                  <input
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Tu apellido"
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3.5 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

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
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3.5 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)] ml-1">
                Contraseña
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-12 pr-12 py-3.5 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] ml-1">
                <CheckCircle2
                  className={`w-4 h-4 transition-colors ${
                    password.length >= 8 ? "text-green-500" : ""
                  }`}
                />
                <span>Al menos 8 caracteres</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Crear mi agencia</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function AppSumoRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--muted-foreground)]">Cargando…</p>
          </div>
        </div>
      }
    >
      <RegistrationForm />
    </Suspense>
  );
}
