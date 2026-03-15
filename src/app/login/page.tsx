"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Plane, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Aquí iría la llamada a la API
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center px-4">
      {/* Fondo gradiente */}
      <div className="gradient-bg" />
      
      {/* Avión de papel animado */}
      <PaperPlaneAnimation />

      {/* Contenedor principal */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 mb-4">
            <Plane className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Trip Conecta B2B</h1>
          <p className="text-slate-400 text-sm mt-1">Panel de Agentes de Viajes</p>
        </motion.div>

        {/* Tarjeta de Login */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card rounded-3xl p-8 border border-white/10 relative"
        >
          {/* Efecto de brillo */}
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-white mb-2">Bienvenido de vuelta</h2>
            <p className="text-slate-400 text-sm">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
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
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón de Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed group"
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
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500 uppercase tracking-wider">o</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Registro */}
          <p className="text-center text-sm text-slate-400">
            ¿No tienes cuenta?{" "}
            <a href="#" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Solicitar acceso
            </a>
          </p>
        </motion.div>

        {/* Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-slate-600 mt-8"
        >
          Trip Conecta SAS • Montevideo, Uruguay
        </motion.p>
      </div>
    </div>
  );
}

// Componente del avión de papel animado
function PaperPlaneAnimation() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Avión principal */}
      <motion.div
        initial={{ x: "-20%", y: "120%", rotate: -15, opacity: 0 }}
        animate={{ 
          x: ["-20%", "30%", "80%", "120%"],
          y: ["120%", "40%", "20%", "-20%"],
          rotate: [-15, -5, 5, 15],
          opacity: [0, 1, 1, 0]
        }}
        transition={{ 
          duration: 15,
          repeat: Infinity,
          repeatDelay: 5,
          ease: "easeInOut"
        }}
        className="absolute w-20 h-20"
      >
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          {/* Cuerpo del avión */}
          <path 
            d="M10 90L90 50L10 10L25 50L10 90Z" 
            fill="url(#planeGradient)"
            fillOpacity="0.3"
            stroke="url(#planeGradient)"
            strokeWidth="1"
          />
          {/* Alas */}
          <path 
            d="M25 50L90 50L50 65L25 50Z" 
            fill="url(#planeGradient)"
            fillOpacity="0.2"
          />
          <path 
            d="M25 50L90 50L50 35L25 50Z" 
            fill="url(#planeGradient)"
            fillOpacity="0.15"
          />
          {/* Gradient */}
          <defs>
            <linearGradient id="planeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
        </svg>
        {/* Estela */}
        <motion.div 
          className="absolute top-1/2 right-full w-32 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 0.5, 0.5, 0] }}
          transition={{ duration: 15, repeat: Infinity, repeatDelay: 5 }}
          style={{ transformOrigin: "right center" }}
        />
      </motion.div>

      {/* Segundo avión (más pequeño, diferente ruta) */}
      <motion.div
        initial={{ x: "-10%", y: "110%", rotate: -10, opacity: 0 }}
        animate={{ 
          x: ["-10%", "50%", "90%", "110%"],
          y: ["110%", "60%", "30%", "-10%"],
          rotate: [-10, 0, 8, 20],
          opacity: [0, 0.6, 0.6, 0]
        }}
        transition={{ 
          duration: 12,
          repeat: Infinity,
          repeatDelay: 8,
          delay: 3,
          ease: "easeInOut"
        }}
        className="absolute w-12 h-12"
      >
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <path 
            d="M10 90L90 50L10 10L25 50L10 90Z" 
            fill="url(#planeGradient2)"
            fillOpacity="0.2"
            stroke="url(#planeGradient2)"
            strokeWidth="1"
          />
          <defs>
            <linearGradient id="planeGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Partículas decorativas */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + i * 10}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Líneas de conexión sutiles */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <motion.path
          d="M0,300 Q400,100 800,400 T1600,200"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="1" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
