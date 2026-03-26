"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, toggleTheme, isRippling } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      disabled={isRippling}
      className={`
        relative w-14 h-14 rounded-full 
        flex items-center justify-center
        transition-all duration-300
        ${isRippling ? 'scale-110' : 'hover:scale-105'}
        ${theme === "light" 
          ? "bg-white border-2 border-emerald-200 shadow-lg shadow-emerald-100" 
          : "bg-slate-800 border-2 border-blue-500/30 shadow-lg shadow-blue-500/20"
        }
      `}
      aria-label={`Cambiar a modo ${theme === "light" ? "oscuro" : "claro"}`}
    >
      {/* Ripple Effect Overlay */}
      <AnimatePresence>
        {isRippling && (
          <>
            {/* Primera onda */}
            <motion.div
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`
                absolute inset-0 rounded-full
                ${theme === "light" ? "bg-slate-900" : "bg-white"}
              `}
            />
            {/* Segunda onda (retardada) */}
            <motion.div
              initial={{ scale: 0, opacity: 0.3 }}
              animate={{ scale: 3.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className={`
                absolute inset-0 rounded-full
                ${theme === "light" ? "bg-slate-800" : "bg-gray-100"}
              `}
            />
          </>
        )}
      </AnimatePresence>

      {/* Icon with rotation */}
      <AnimatePresence mode="wait">
        {theme === "light" ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <Sun className="w-6 h-6 text-amber-500" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <Moon className="w-6 h-6 text-blue-400" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glow effect */}
      <div 
        className={`
          absolute inset-0 rounded-full opacity-50 blur-md -z-10
          ${theme === "light" 
            ? "bg-gradient-to-br from-amber-200 to-orange-200" 
            : "bg-gradient-to-br from-blue-400 to-purple-400"
          }
        `}
      />
    </button>
  );
}
