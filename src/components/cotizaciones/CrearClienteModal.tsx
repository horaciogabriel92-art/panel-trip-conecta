'use client';

import { useState } from 'react';
import { X, Loader2, User } from 'lucide-react';
import { clientesAPI, ClienteInput } from '@/lib/api-clientes';

interface CrearClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClienteCreado: (cliente: any) => void;
}

export default function CrearClienteModal({ isOpen, onClose, onClienteCreado }: CrearClienteModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<ClienteInput>({
    tipo_documento: 'CI',
    documento: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    nacionalidad: 'Uruguay'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validar campos mínimos
      if (!formData.nombre || !formData.apellido) {
        setError('Nombre y apellido son requeridos');
        setLoading(false);
        return;
      }

      if (!formData.documento && !formData.email) {
        setError('Debe proporcionar al menos documento o email');
        setLoading(false);
        return;
      }

      const result = await clientesAPI.crear(formData);
      onClienteCreado(result.cliente);
      onClose();
      
      // Reset form
      setFormData({
        tipo_documento: 'CI',
        documento: '',
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        nacionalidad: 'Uruguay'
      });
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('Ya existe un cliente con este email o documento');
      } else {
        setError(err.response?.data?.error || 'Error al crear cliente');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--foreground)]">Nuevo Cliente</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Se creará automáticamente como pasajero titular
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--muted-foreground)]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Documento */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                Tipo
              </label>
              <select
                value={formData.tipo_documento}
                onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
              >
                <option value="CI">CI</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                Documento
              </label>
              <input
                type="text"
                value={formData.documento}
                onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
                placeholder="Número de documento"
              />
            </div>
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
                placeholder="Nombre"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                Apellido *
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
                placeholder="Apellido"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
              placeholder="cliente@email.com"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
              placeholder="099 123 456"
            />
          </div>

          {/* Fecha de nacimiento */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              value={formData.fecha_nacimiento}
              onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
            />
          </div>

          {/* Nacionalidad */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
              Nacionalidad
            </label>
            <input
              type="text"
              value={formData.nacionalidad}
              onChange={(e) => setFormData({ ...formData, nacionalidad: e.target.value })}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-[var(--border)] rounded-xl text-[var(--foreground)] font-medium hover:bg-[var(--muted)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Cliente'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
