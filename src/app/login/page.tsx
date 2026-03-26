"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight,
  Plane
} from "lucide-react";

// Import dinámico del ThemeToggle para evitar SSR
const ThemeToggle = dynamic(() => import("@/components/ThemeToggle").then(mod => mod.ThemeToggle), {
  ssr: false,
  loading: () => <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse" />
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        login(data.token, data.user);
      } else {
        alert(data.error || "Credenciales inválidas");
      }
    } catch (error) {
      console.error("Error de login:", error);
      alert("Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 bg-[var(--background)]">
      {/* Fondo gradiente adaptativo */}
      <div className="gradient-bg" />
      
      {/* Elementos decorativos flotantes */}
      <FloatingElements />

      {/* Theme Toggle - Cargado dinámicamente sin SSR */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Contenedor principal */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src="/logo-trip-conecta-v2.png" 
              alt="Trip Conecta" 
              className="h-32 w-auto object-contain drop-shadow-lg"
            />
          </div>
        </motion.div>

        {/* Tarjeta de Login */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card rounded-3xl p-8 relative"
        >
          {/* Efecto de brillo superior */}
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-50" />
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              Bienvenido de vuelta
            </h2>
            <p className="text-[var(--muted-foreground)] text-sm">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
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

            {/* Contraseña */}
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
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-12 pr-12 py-3.5 
                           text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] 
                           focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 
                           transition-all"
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
            </div>

            {/* Recuperar contraseña */}
            <div className="flex justify-end">
              <a 
                href="#" 
                className="text-sm text-[var(--primary)] hover:text-[var(--accent)] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón de Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Separador */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">o</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* Registro */}
          <p className="text-center text-sm text-[var(--muted-foreground)]">
            ¿No tienes cuenta?{" "}
            <a href="#" className="text-[var(--primary)] hover:text-[var(--accent)] font-medium transition-colors">
              Solicitar acceso
            </a>
          </p>
        </motion.div>

        {/* Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-[var(--muted-foreground)] mt-8"
        >
          Trip Conecta SAS • Montevideo, Uruguay
        </motion.p>
      </div>
    </div>
  );
}

// Componente de elementos flotantes decorativos
function FloatingElements() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Círculos decorativos */}
      <motion.div
        animate={{
          y: [-20, 20, -20],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 blur-2xl"
      />
      
      <motion.div
        animate={{
          y: [20, -20, 20],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-gradient-to-br from-cyan-200/20 to-blue-200/20 blur-2xl"
      />

      {/* Avión de papel sutil */}
      <motion.div
        initial={{ x: "-10%", y: "110%", opacity: 0 }}
        animate={{ 
          x: ["-10%", "50%", "110%"],
          y: ["110%", "50%", "-10%"],
          opacity: [0, 0.3, 0],
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          repeatDelay: 5,
          ease: "easeInOut",
        }}
        className="absolute"
      >
        <Plane className="w-12 h-12 text-emerald-400/30" />
      </motion.div>

      {/* Líneas de conexión sutiles */}
      <svg className="absolute inset-0 w-full h-full opacity-5">
        <motion.path
          d="M0,200 Q400,100 800,300 T1600,200"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
