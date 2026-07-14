"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const COOKIE_NAME = "NEXT_LOCALE";

const locales = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
] as const;

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (nextLocale: string) => {
    if (nextLocale === locale) {
      setOpen(false);
      return;
    }
    document.cookie = `${COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    setOpen(false);
    router.refresh();
  };

  const current = locales.find((l) => l.code === locale) ?? locales[0];

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Cambiar idioma"
        className={`
          flex items-center justify-center gap-2
          w-14 h-14 rounded-full
          bg-white dark:bg-slate-800
          border-2 border-emerald-200 dark:border-blue-500/30
          shadow-lg shadow-emerald-100 dark:shadow-blue-500/20
          text-[var(--foreground)]
          hover:scale-105 transition-transform duration-200
        `}
      >
        <Globe className="w-5 h-5 text-emerald-600 dark:text-blue-400" />
        <span className="text-xs font-bold uppercase">{current.code}</span>
      </button>

      {open && (
        <div
          className={`
            absolute right-0 top-full mt-2 z-50
            min-w-[160px]
            rounded-2xl
            bg-white dark:bg-slate-800
            border border-[var(--border)]
            shadow-xl
            overflow-hidden
          `}
        >
          {locales.map((l) => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code)}
              className={`
                w-full flex items-center justify-between px-4 py-3
                text-sm font-medium
                hover:bg-[var(--muted)]
                transition-colors
                ${l.code === locale ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--foreground)]"}
              `}
            >
              <span>{l.label}</span>
              {l.code === locale && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
