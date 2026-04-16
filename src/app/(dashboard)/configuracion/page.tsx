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
  FileText,
  Palette,
  RotateCcw,
} from "lucide-react";

const DEFAULT_PDF_COLORS = {
  primary: "#0d9488",
  primaryDark: "#0f766e",
  primaryLight: "#14b8a6",
  accent: "#5eead4",
  dark: "#134e4a",
  text: "#1f2937",
  textLight: "#6b7280",
  background: "#f0fdfa",
};

const COLOR_LABELS: Record<string, string> = {
  primary: "Color principal",
  primaryDark: "Principal oscuro",
  primaryLight: "Principal claro",
  accent: "Acento",
  dark: "Textos destacados",
  text: "Texto principal",
  textLight: "Texto secundario",
  background: "Fondo de tarjetas",
};

export default function ConfiguracionPage() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState<"perfil" | "seguridad" | "pdf">("perfil");
  const [isLoading, setIsLoading] = useState(false);

  // Perfil
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
  });

  // Seguridad
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // PDF
  const [pdfColors, setPdfColors] = useState(DEFAULT_PDF_COLORS);
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const [pdfMessage, setPdfMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
        if (data.preferencias?.pdf_colors) {
          setPdfColors({ ...DEFAULT_PDF_COLORS, ...data.preferencias.pdf_colors });
        }
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

      // Actualizar localStorage/user context
      if (user) {
        login(localStorage.getItem("token") || "", { ...user, ...res.data });
      }
    } catch (error: any) {
      console.error("Error guardando perfil:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Error al guardar los cambios",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePdfColors = async () => {
    setIsSavingPdf(true);
    setPdfMessage(null);
    try {
      const res = await api.put("/auth/profile", {
        preferencias: { pdf_colors: pdfColors },
      });
      setPdfMessage({ type: "success", text: "Colores del PDF guardados correctamente" });
      if (user) {
        login(localStorage.getItem("token") || "", { ...user, ...res.data });
      }
    } catch (error: any) {
      console.error("Error guardando colores:", error);
      setPdfMessage({
        type: "error",
        text: error.response?.data?.error || "Error al guardar los colores",
      });
    } finally {
      setIsSavingPdf(false);
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
    <div className="space-y-6 animate-in fade-in duration-700 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[var(--foreground)]">Configuración</h2>
        <p className="text-[var(--muted-foreground)]">Gestiona tu información personal y preferencias</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-1">
        <button
          onClick={() => setActiveTab("perfil")}
          className={`px-4 py-2 rounded-t-xl text-sm font-medium transition-colors ${
            activeTab === "perfil"
              ? "bg-[var(--muted)] text-[var(--foreground)] border-t border-x border-[var(--border)]"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <span className="flex items-center gap-2">
            <User className="w-4 h-4" /> Perfil
          </span>
        </button>
        <button
          onClick={() => setActiveTab("seguridad")}
          className={`px-4 py-2 rounded-t-xl text-sm font-medium transition-colors ${
            activeTab === "seguridad"
              ? "bg-[var(--muted)] text-[var(--foreground)] border-t border-x border-[var(--border)]"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4" /> Seguridad
          </span>
        </button>
        <button
          onClick={() => setActiveTab("pdf")}
          className={`px-4 py-2 rounded-t-xl text-sm font-medium transition-colors ${
            activeTab === "pdf"
              ? "bg-[var(--muted)] text-[var(--foreground)] border-t border-x border-[var(--border)]"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Personalizar PDF
          </span>
        </button>
      </div>

      {/* Tab Perfil */}
      {activeTab === "perfil" && (
        <form onSubmit={handleSubmit} className="space-y-6">
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
              <User className="w-5 h-5 text-blue-400" />
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--muted-foreground)] mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--muted-foreground)] mb-1">Apellido</label>
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

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-400" />
              Contacto
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--muted-foreground)] mb-1">Email</label>
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
                <label className="block text-sm text-[var(--muted-foreground)] mb-1">Teléfono</label>
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

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Información del Sistema</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted-foreground)]">Rol</span>
                <span className="font-medium text-[var(--foreground)] capitalize">{user?.rol || "Vendedor"}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-xl font-medium transition-colors"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar cambios
            </button>
          </div>
        </form>
      )}

      {/* Tab Seguridad */}
      {activeTab === "seguridad" && (
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
              {passwordMessage.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {passwordMessage.text}
            </div>
          )}

          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">Contraseña actual</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">Nueva contraseña</label>
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
            <label className="block text-sm text-[var(--muted-foreground)] mb-1">Confirmar nueva contraseña</label>
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
              {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Cambiar contraseña
            </button>
          </div>
        </form>
      )}

      {/* Tab Personalizar PDF */}
      {activeTab === "pdf" && (
        <div className="space-y-6">
          {pdfMessage && (
            <div
              className={`flex items-center gap-2 p-4 rounded-xl ${
                pdfMessage.type === "success"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {pdfMessage.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {pdfMessage.text}
            </div>
          )}

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-400" />
              Colores de tu cotización PDF
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {Object.entries(pdfColors).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-xl">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => setPdfColors((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="w-10 h-10 rounded-lg border-0 p-0 cursor-pointer bg-transparent"
                    />
                    <span className="text-sm text-[var(--foreground)]">{COLOR_LABELS[key]}</span>
                  </div>
                  <span className="text-xs font-mono text-[var(--muted-foreground)] uppercase">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setPdfColors(DEFAULT_PDF_COLORS)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--foreground)] rounded-xl font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Restaurar colores por defecto
              </button>
              <button
                type="button"
                onClick={handleSavePdfColors}
                disabled={isSavingPdf}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-xl font-medium transition-colors"
              >
                {isSavingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar preferencias
              </button>
            </div>
          </div>

          {/* Preview visual del PDF */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-bold text-[var(--foreground)] mb-4">Vista previa aproximada</h3>
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: pdfColors.primary }}
            >
              {/* Header simulado */}
              <div
                className="p-4 flex justify-between items-center"
                style={{ borderBottom: `2px solid ${pdfColors.primary}` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: pdfColors.primary }}
                  >
                    TC
                  </div>
                  <div>
                    <div className="text-base font-bold" style={{ color: pdfColors.dark }}>
                      Trip Conecta
                    </div>
                    <div className="text-[10px]" style={{ color: pdfColors.textLight }}>
                      Agencia de viajes
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: pdfColors.primary }}>
                    COT-2024-001
                  </div>
                  <div className="text-[10px]" style={{ color: pdfColors.textLight }}>
                    16/04/2026
                  </div>
                </div>
              </div>

              {/* Contenido simulado */}
              <div className="p-4 space-y-3 bg-white">
                <div
                  className="p-3 rounded-md"
                  style={{ backgroundColor: pdfColors.background, borderLeft: `4px solid ${pdfColors.primary}` }}
                >
                  <div className="text-xs font-bold mb-1" style={{ color: pdfColors.primary }}>
                    PAQUETE
                  </div>
                  <div className="text-sm font-bold" style={{ color: pdfColors.dark }}>
                    Europa Express 2024
                  </div>
                  <div className="text-[10px]" style={{ color: pdfColors.textLight }}>
                    Madrid, España • 10 días
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div
                    className="p-2 rounded-md"
                    style={{ backgroundColor: pdfColors.background }}
                  >
                    <div className="text-[10px]" style={{ color: pdfColors.textLight }}>
                      Pasajeros
                    </div>
                    <div className="text-sm font-bold" style={{ color: pdfColors.text }}>
                      2
                    </div>
                  </div>
                  <div
                    className="p-2 rounded-md"
                    style={{ backgroundColor: pdfColors.background }}
                  >
                    <div className="text-[10px]" style={{ color: pdfColors.textLight }}>
                      Total
                    </div>
                    <div className="text-sm font-bold" style={{ color: pdfColors.primary }}>
                      $2.500
                    </div>
                  </div>
                </div>

                <div
                  className="p-2 rounded-md text-center text-[10px]"
                  style={{ backgroundColor: pdfColors.background, border: `1px solid ${pdfColors.primaryLight}` }}
                >
                  <span style={{ color: pdfColors.dark }}>
                    Validez de 24 horas desde la emisión.
                  </span>
                </div>
              </div>

              {/* Footer simulado */}
              <div
                className="p-3 flex justify-between items-center"
                style={{ borderTop: `1px solid ${pdfColors.primaryLight}` }}
              >
                <div className="text-[10px]" style={{ color: pdfColors.textLight }}>
                  tripconecta.com
                </div>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                  style={{ backgroundColor: pdfColors.primary }}
                >
                  JP
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
