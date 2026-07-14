"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useTranslations } from "next-intl";
import {
  Mail,
  Shield,
  Check,
  X,
  Loader2,
  UserPlus,
  ToggleLeft,
  ToggleRight,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserItem {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: "admin" | "vendedor";
  activo: boolean;
  permisos: Record<string, boolean>;
}

const ALL_PERMISSIONS = [
  { key: "ver_todas_cotizaciones" },
  { key: "ver_todas_ventas" },
  { key: "ver_reportes" },
  { key: "gestionar_paquetes" },
  { key: "ver_comisiones_otros" },
  { key: "editar_clientes_otros" },
];

const defaultVendedorPermissions: Record<string, boolean> = {
  ver_todas_cotizaciones: false,
  ver_todas_ventas: false,
  ver_reportes: false,
  gestionar_paquetes: true,
  ver_comisiones_otros: false,
  editar_clientes_otros: false,
};

export default function UsersTab() {
  const { user: currentUser } = useAuth();
  const t = useTranslations("configuracion.users");
  const tAuth = useTranslations("auth");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const [newUser, setNewUser] = useState<{
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    rol: "admin" | "vendedor";
    permisos: Record<string, boolean>;
  }>({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    rol: "vendedor",
    permisos: { ...defaultVendedorPermissions },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/auth/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setMessage({ type: "error", text: t("loadError") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsCreating(true);
    try {
      await api.post("/auth/users", newUser);
      setNewUser({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        rol: "vendedor",
        permisos: { ...defaultVendedorPermissions },
      });
      setMessage({ type: "success", text: t("createSuccess") });
      fetchUsers();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || t("createError"),
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdatePermissions = async (userId: string, permisos: Record<string, boolean>) => {
    setIsSaving(userId);
    setMessage(null);
    try {
      await api.put(`/auth/users/${userId}`, { permisos });
      setMessage({ type: "success", text: t("permissionsUpdated") });
      fetchUsers();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || t("permissionsUpdateError"),
      });
    } finally {
      setIsSaving(null);
    }
  };

  const handleToggleActive = async (u: UserItem) => {
    if (String(u.id) === String(currentUser?.id)) {
      setMessage({ type: "error", text: t("cannotDeactivateSelf") });
      return;
    }
    setIsSaving(u.id);
    setMessage(null);
    try {
      await api.put(`/auth/users/${u.id}`, { activo: !u.activo });
      setMessage({ type: "success", text: u.activo ? t("userDeactivated") : t("userActivated") });
      fetchUsers();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || t("statusChangeError"),
      });
    } finally {
      setIsSaving(null);
    }
  };

  const togglePermission = (permisos: Record<string, boolean>, key: string) => {
    return { ...permisos, [key]: !permisos[key] };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

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

      {/* Create user form */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-emerald-400" />
          {t("inviteTitle")}
        </h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder={t("firstNamePlaceholder")}
              value={newUser.nombre}
              onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder={t("lastNamePlaceholder")}
              value={newUser.apellido}
              onChange={(e) => setNewUser({ ...newUser, apellido: e.target.value })}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="email"
              placeholder={t("emailPlaceholder")}
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              required
            />
            <input
              type="password"
              placeholder={t("tempPasswordPlaceholder")}
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              minLength={6}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">{tAuth("profile.role")}</label>
              <select
                value={newUser.rol}
                onChange={(e) => {
                  const rol = e.target.value as "admin" | "vendedor";
                  setNewUser({
                    ...newUser,
                    rol,
                    permisos: rol === "admin" ? {} : { ...defaultVendedorPermissions },
                  });
                }}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none"
              >
                <option value="vendedor">{tAuth("roles.vendedor")}</option>
                <option value="admin">{tAuth("roles.admin")}</option>
              </select>
            </div>
          </div>

          {newUser.rol === "vendedor" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_PERMISSIONS.map((perm) => (
                <label
                  key={perm.key}
                  className="flex items-center gap-2 p-3 bg-[var(--muted)] rounded-xl cursor-pointer hover:bg-[var(--border)] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={newUser.permisos[perm.key] || false}
                    onChange={() =>
                      setNewUser({ ...newUser, permisos: togglePermission(newUser.permisos, perm.key) })
                    }
                    className="w-4 h-4 rounded border-[var(--border)] text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-[var(--foreground)]">{t(`permissionLabels.${perm.key}`)}</span>
                </label>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={isCreating}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-xl font-medium transition-colors"
          >
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {t("createUser")}
          </button>
        </form>
      </div>

      {/* Users list */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          {t("usersListTitle")}
        </h3>

        <div className="space-y-4">
          {users.map((u) => {
            const isCurrentUser = String(u.id) === String(currentUser?.id);
            return (
            <div
              key={u.id}
              className={cn(
                "p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]",
                !u.activo && "opacity-60"
              )}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                    {u.nombre?.[0]}{u.apellido?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">
                      {u.nombre} {u.apellido}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-2">
                      <Mail className="w-3 h-3" /> {u.email}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase",
                      u.activo
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    )}
                  >
                    {u.activo ? t("active") : t("inactive")}
                  </span>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase",
                      u.rol === "admin"
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    )}
                  >
                    {u.rol === "admin" ? tAuth("roles.admin") : tAuth("roles.vendedor")}
                  </span>
                  {!isCurrentUser && (
                    <button
                      onClick={() => handleToggleActive(u)}
                      disabled={isSaving === u.id}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        u.activo
                          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                      )}
                    >
                      {isSaving === u.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : u.activo ? (
                        <>
                          <X className="w-3 h-3" /> {t("deactivate")}
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3" /> {t("activate")}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {u.rol !== "admin" && !isCurrentUser && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-[var(--muted-foreground)] flex items-center gap-2">
                    <Shield className="w-4 h-4" /> {t("permissions")}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {ALL_PERMISSIONS.map((perm) => {
                      const isEnabled = u.permisos?.[perm.key] || false;
                      return (
                        <button
                          key={perm.key}
                          onClick={() =>
                            handleUpdatePermissions(u.id, togglePermission(u.permisos || {}, perm.key))
                          }
                          disabled={isSaving === u.id}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg text-sm transition-colors border",
                            isEnabled
                              ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                              : "bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)]"
                          )}
                        >
                          <span>{t(`permissionLabels.${perm.key}`)}</span>
                          {isEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

function AlertCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
