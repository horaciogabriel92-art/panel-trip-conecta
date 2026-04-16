"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
  User,
  Mail,
  Phone,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Lock,
} from "lucide-react";

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Cargar datos del usuario
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/auth/profile");
        const data = res.data;
        setFormData({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          email: data.email || "",
          telefono: data.telefono || "",
        });
      } catch (error) {
        console.error("Error cargando perfil:", error);
        setMessage({ type: "error", text: "Error al cargar los datos del perfil" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Las nuevas contraseñas no coinciden" });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "La nueva contraseña debe tener al menos 6 caracteres" });
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordMessage({ type: "success", text: "Contraseña actualizada correctamente" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      console.error("Error cambiando contraseña:", error);
      setPasswordMessage({
        type: "error",
        text: error.response?.data?.error || "Error al cambiar la contraseña",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await api.put("/auth/profile", {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
      });

      setMessage({ type: "success", text: "Perfil actualizado correctamente" });
      
      // Recargar la página después de 1 segundo para reflejar cambios
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("Error guardando perfil:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.error || "Error al guardar los cambios" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[var(--foreground)]">
          Configuración
        </h2>
        <p className="text-[var(--muted-foreground)]">
          Gestiona tu información personal
        </p>
      </div>

      {/* Mensaje de éxito/error */}
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

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Personal */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Información Personal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Apellido
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => handleChange("apellido", e.target.value)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-400" />
            Contacto
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-[var(--foreground)] opacity-60 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                El email no puede modificarse. Contacta a un administrador si necesitas cambiarlo.
              </p>
            </div>
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleChange("telefono", e.target.value)}
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
                  placeholder="+598 99 123 456"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Información del Sistema (solo lectura) */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">
            Información del Sistema
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--muted-foreground)]">Rol</span>
              <span className="font-medium text-[var(--foreground)] capitalize">
                {user?.rol || "Vendedor"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--muted-foreground)]">Rol</span>
              <span className="font-medium text-[var(--foreground)] capitalize">
                {user?.rol || "Vendedor"}
              </span>
            </div>
          </div>
        </div>

        {/* Seguridad */}
        <form onSubmit={handleChangePassword} className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-400" />
            Seguridad
          </h3>

          {passwordMessage && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl ${
                passwordMessage.type === "success"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {passwordMessage.type === "success" ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {passwordMessage.text}
            </div>
          )}

          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">
              Contraseña actual
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">
              Nueva contraseña
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              required
              minLength={6}
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-xl font-medium transition-colors"
            >
              {isChangingPassword ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              Cambiar contraseña
            </button>
          </div>
        </form>

        {/* Botón Guardar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-xl font-medium transition-colors"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
