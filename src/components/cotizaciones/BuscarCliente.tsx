'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, User, Plus, Check, Loader2 } from 'lucide-react';
import { clientesAPI, BuscarClienteResult, Cliente } from '@/lib/api-clientes';
import { debounce } from '@/lib/utils';

interface BuscarClienteProps {
  onSelect: (cliente: Cliente | null) => void;
  onNuevoCliente: () => void;
  selectedClienteId?: string | null;
}

export default function BuscarCliente({ onSelect, onNuevoCliente, selectedClienteId }: BuscarClienteProps) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<BuscarClienteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  // Buscar clientes con debounce
  const buscarClientes = useCallback(
    debounce(async (searchTerm: string) => {
      if (!searchTerm || searchTerm.length < 2) {
        setResultados([]);
        setLoading(false);
        return;
      }

      try {
        const { data } = await clientesAPI.buscar(searchTerm);
        setResultados(data || []);
      } catch (err) {
        console.error('Error buscando clientes:', err);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (query.length >= 2) {
      setLoading(true);
      buscarClientes(query);
      setShowResults(true);
    } else {
      setResultados([]);
      setShowResults(false);
    }
  }, [query, buscarClientes]);

  // Cargar cliente seleccionado si viene de fuera
  useEffect(() => {
    if (selectedClienteId && !selectedCliente) {
      clientesAPI.obtener(selectedClienteId)
        .then(({ cliente }) => setSelectedCliente(cliente))
        .catch(console.error);
    }
  }, [selectedClienteId]);

  const handleSelect = async (cliente: BuscarClienteResult) => {
    try {
      const { cliente: fullCliente } = await clientesAPI.obtener(cliente.id);
      setSelectedCliente(fullCliente);
      onSelect(fullCliente);
      setShowResults(false);
      setQuery('');
    } catch (err) {
      console.error('Error cargando cliente:', err);
    }
  };

  const handleClear = () => {
    setSelectedCliente(null);
    onSelect(null);
    setQuery('');
  };

  // Si hay un cliente seleccionado, mostrarlo
  if (selectedCliente) {
    return (
      <div className="bg-[var(--muted)] border border-[var(--border)] rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <User className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[var(--foreground)]">
              {selectedCliente.nombre} {selectedCliente.apellido}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              {selectedCliente.email || 'Sin email'} • {selectedCliente.tipo_documento} {selectedCliente.documento}
            </p>
          </div>
          <button
            onClick={handleClear}
            className="text-sm text-red-400 hover:text-red-300 font-medium"
          >
            Cambiar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Input de búsqueda */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, email o documento..."
          className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-blue-500 focus:outline-none"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 animate-spin" />
        )}
      </div>

      {/* Resultados */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
          {resultados.length === 0 ? (
            <div className="p-4 text-center text-[var(--muted-foreground)]">
              <p>No se encontraron clientes</p>
              <button
                onClick={onNuevoCliente}
                className="mt-2 text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Crear nuevo cliente
              </button>
            </div>
          ) : (
            <>
              {resultados.map((cliente) => (
                <button
                  key={cliente.id}
                  onClick={() => handleSelect(cliente)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-[var(--muted)] transition-colors text-left border-b border-[var(--border)] last:border-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--foreground)] truncate">
                      {cliente.nombre} {cliente.apellido}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)] truncate">
                      {cliente.email || 'Sin email'} • {cliente.tipo_documento} {cliente.documento}
                    </p>
                  </div>
                </button>
              ))}
              <button
                onClick={onNuevoCliente}
                className="w-full flex items-center gap-4 p-4 hover:bg-[var(--muted)] transition-colors text-left text-blue-400 font-medium sticky bottom-0 bg-[var(--card)] border-t border-[var(--border)]"
              >
                <Plus className="w-5 h-5" />
                Crear nuevo cliente
              </button>
            </>
          )}
        </div>
      )}

      {/* Botón crear cliente si no hay búsqueda */}
      {!showResults && !query && (
        <button
          onClick={onNuevoCliente}
          className="mt-3 w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[var(--border)] rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-[var(--muted-foreground)] hover:text-blue-400"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Crear nuevo cliente</span>
        </button>
      )}
    </div>
  );
}
