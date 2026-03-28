"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, User, Phone, Mail, Loader2, ChevronRight } from "lucide-react";
import { clientesAPI, Cliente } from "@/lib/api-clientes";
import { debounce } from "@/lib/utils";

export default function AdminClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });

  const fetchClientes = useCallback(async (page = 1, search = "") => {
    try {
      setLoading(true);
      const response = await clientesAPI.listar({
        page,
        limit: 20,
        q: search || undefined,
      });
      setClientes(response.data || []);
      setMeta(response.meta);
    } catch (err) {
      console.error("Error fetching clientes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      fetchClientes(1, query);
    }, 300),
    [fetchClientes]
  );

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[var(--foreground)]">Clientes</h2>
          <p className="text-[var(--muted-foreground)]">
            {meta.total} clientes registrados
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/clientes/nuevo")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre, email o documento..."
          className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : clientes.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No se encontraron clientes</p>
          <p className="text-sm">Intenta con otra búsqueda o crea un nuevo cliente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clientes.map((cliente) => (
            <button
              key={cliente.id}
              onClick={() => router.push(`/admin/clientes/${cliente.id}`)}
              className="w-full flex items-center gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:border-blue-500/50 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20">
                <User className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--foreground)] truncate">
                  {cliente.nombre} {cliente.apellido}
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-[var(--muted-foreground)]">
                  {cliente.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {cliente.email}
                    </span>
                  )}
                  {cliente.telefono && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {cliente.telefono}
                    </span>
                  )}
                  <span className="text-xs bg-[var(--muted)] px-2 py-0.5 rounded">
                    {cliente.tipo_documento} {cliente.documento}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-blue-400" />
            </button>
          ))}
        </div>
      )}

      {/* Paginación */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchClientes(page, searchQuery)}
              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                page === meta.page
                  ? "bg-blue-600 text-white"
                  : "bg-[var(--card)] border border-[var(--border)] hover:border-blue-500/50"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
