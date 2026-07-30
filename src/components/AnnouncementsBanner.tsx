"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { X, Info, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Announcement {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: "info" | "warning" | "success";
  leido: boolean;
}

const config = {
  info: { icon: Info, bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-500" },
  warning: { icon: AlertTriangle, bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-500" },
  success: { icon: CheckCircle2, bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-500" },
};

export default function AnnouncementsBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    api
      .get("/announcements")
      .then((res) => setAnnouncements(res.data.announcements || []))
      .catch((err) => console.error("Error cargando anuncios:", err));
  }, []);

  const markRead = async (id: string) => {
    try {
      await api.post(`/announcements/${id}/read`);
      setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, leido: true } : a)));
    } catch (err) {
      console.error("Error marcando anuncio:", err);
    }
  };

  const visible = announcements.filter((a) => !a.leido && !dismissed.includes(a.id));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((a) => {
        const c = config[a.tipo];
        const Icon = c.icon;
        return (
          <div
            key={a.id}
            className={`${c.bg} border ${c.border} rounded-xl p-4 flex items-start gap-3`}
          >
            <Icon className={`w-5 h-5 ${c.text} shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${c.text}`}>{a.titulo}</p>
              <p className="text-sm text-[var(--foreground)] mt-1">{a.mensaje}</p>
            </div>
            <button
              onClick={() => {
                setDismissed((prev) => [...prev, a.id]);
                markRead(a.id);
              }}
              className="p-1 rounded-lg hover:bg-black/5 text-[var(--muted-foreground)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
