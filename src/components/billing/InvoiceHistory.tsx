"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface Invoice {
  id: string;
  amount_total_usd: number;
  currency: string;
  status: "paid" | "unpaid" | "void" | "refunded" | "open";
  billing_reason?: string;
  period_start?: string;
  period_end?: string;
  description?: string;
  paid_at?: string;
  created_at: string;
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

export default function InvoiceHistory() {
  const t = useTranslations("plan.invoice");
  const locale = useLocale();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString(locale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">
            <CheckCircle2 className="w-3 h-3" />
            {t("statuses.paid")}
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">
            {t("statuses.refunded")}
          </span>
        );
      case "void":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 text-xs font-bold">
            {t("statuses.void")}
          </span>
        );
      case "unpaid":
      case "open":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
            <AlertCircle className="w-3 h-3" />
            {t("statuses.pending")}
          </span>
        );
    }
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/billing/invoices`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || t("loadError"));
        }

        const data = await res.json();
        setInvoices(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [t]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl p-4 border border-red-500/20 bg-red-500/10 text-red-400 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p className="text-sm">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
            <th className="pb-3 font-semibold">{t("date")}</th>
            <th className="pb-3 font-semibold">{t("description")}</th>
            <th className="pb-3 font-semibold">{t("period")}</th>
            <th className="pb-3 font-semibold">{t("amount")}</th>
            <th className="pb-3 font-semibold">{t("status")}</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-b border-[var(--border)] last:border-0">
              <td className="py-4 text-[var(--foreground)]">{formatDate(invoice.created_at)}</td>
              <td className="py-4 text-[var(--foreground)]">
                {invoice.description || t("defaultDescription")}
              </td>
              <td className="py-4 text-[var(--muted-foreground)]">
                {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
              </td>
              <td className="py-4 font-bold text-[var(--foreground)]">
                {formatCurrency(invoice.amount_total_usd, invoice.currency)}
              </td>
              <td className="py-4">{getStatusBadge(invoice.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
