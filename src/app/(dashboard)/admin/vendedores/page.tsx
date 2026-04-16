"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Users, Search, Plus, Edit, Mail, Phone, Percent, CheckCircle, XCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

interface Vendedor {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  rol: string;
  activo: boolean;
  comision_porcentaje: number;
  fecha_registro: string;
}

export default function VendedoresAdmin() {
  const { error: toastError, success: toastSuccess } = useToast();
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal crear
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    telefono: '',
    comision_porcentaje: 12
  });

  // Modal editar
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    telefono: '',
    comision_porcentaje: 12,
    activo: true
  });

  useEffect(() => {
    fetchVendedores();
  }, []);

  const fetchVendedores = async () => {
    try {
      const res = await api.get('/auth/users');
      const soloVendedores = res.data.filter((u: Vendedor) => u.rol === 'vendedor');
      setVendedores(soloVendedores);
    } catch (err) {
      console.error('Error fetching vendedores:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/users', {
        ...formData,
        rol: 'vendedor'
      });
      setShowModal(false);
      setFormData({
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        telefono: '',
        comision_porcentaje: 12
      });
      fetchVendedores();
      toastSuccess('Vendedor creado exitosamente');
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Error al crear vendedor', 'Error');
    }
  };

  const openEditModal = (v: Vendedor) => {
    setEditingId(v.id);
    setEditFormData({
      email: v.email,
      password: '',
      nombre: v.nombre,
      apellido: v.apellido,
      telefono: v.telefono || '',
      comision_porcentaje: v.comision_porcentaje,
      activo: v.activo
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      const payload: any = {
        nombre: editFormData.nombre,
        apellido: editFormData.apellido,
        telefono: editFormData.telefono,
        email: editFormData.email,
        comision_porcentaje: editFormData.comision_porcentaje,
        activo: editFormData.activo
      };
      if (editFormData.password && editFormData.password.length >= 6) {
        payload.password = editFormData.password;
      }
      await api.put(`/auth/users/${editingId}`, payload);
      setShowEditModal(false);
      setEditingId(null);
      setEditFormData({
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        telefono: '',
        comision_porcentaje: 12,
        activo: true
      });
      fetchVendedores();
      toastSuccess('Vendedor actualizado exitosamente');
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Error al actualizar vendedor', 'Error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[var(--foreground)]">Gestión de Vendedores</h2>
          <p className="text-[var(--muted-foreground)]">Administra tu red de agentes de viajes</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-[var(--foreground)] font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Vendedor
        </button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-2 max-w-md">
            <Search className="w-4 h-4 text-[var(--muted-foreground)]" />
            <input 
              type="text" 
              placeholder="Buscar vendedor..." 
              className="bg-transparent border-none outline-none text-sm w-full text-[var(--foreground)]" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--muted)] text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-black">Vendedor</th>
                <th className="px-6 py-4 font-black">Contacto</th>
                <th className="px-6 py-4 font-black">Comisión</th>
                <th className="px-6 py-4 font-black">Estado</th>
                <th className="px-6 py-4 font-black">Registro</th>
                <th className="px-6 py-4 font-black text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {vendedores.map((v) => (
                <tr key={v.id} className="hover:bg-[var(--muted)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <span className="text-blue-400 font-bold">
                          {v.nombre[0]}{v.apellido[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-[var(--foreground)]">{v.nombre} {v.apellido}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">ID: {v.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm text-[var(--foreground)] flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {v.email}
                      </p>
                      {v.telefono && (
                        <p className="text-sm text-[var(--foreground)] flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {v.telefono}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Percent className="w-3 h-3" /> {v.comision_porcentaje}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {v.activo ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-green-500/10 text-green-400 border border-green-500/20">
                        <CheckCircle className="w-3 h-3" /> Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                        <XCircle className="w-3 h-3" /> Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                    {new Date(v.fecha_registro).toLocaleDateString('es-UY')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/vendedores/${v.id}`}
                        className="p-2 hover:bg-blue-500/20 rounded-lg text-[var(--muted-foreground)] hover:text-blue-400 transition-all"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => openEditModal(v)}
                        className="p-2 hover:bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && (
            <div className="p-20 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Modal Nuevo Vendedor */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg rounded-3xl p-8">
            <h3 className="text-2xl font-black text-[var(--foreground)] mb-6">Nuevo Vendedor</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Apellido</label>
                  <input
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Comisión (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={formData.comision_porcentaje}
                    onChange={(e) => setFormData({...formData, comision_porcentaje: Number(e.target.value)})}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted)] text-[var(--foreground)] font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-[var(--foreground)] font-bold transition-all"
                >
                  Crear Vendedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Vendedor */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg rounded-3xl p-8">
            <h3 className="text-2xl font-black text-[var(--foreground)] mb-6">Editar Vendedor</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Nombre</label>
                  <input
                    type="text"
                    required
                    value={editFormData.nombre}
                    onChange={(e) => setEditFormData({...editFormData, nombre: e.target.value})}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Apellido</label>
                  <input
                    type="text"
                    required
                    value={editFormData.apellido}
                    onChange={(e) => setEditFormData({...editFormData, apellido: e.target.value})}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Email</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Contraseña (solo si querés cambiarla)</label>
                <input
                  type="password"
                  minLength={6}
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                  placeholder="Dejar vacío para mantener la actual"
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Teléfono</label>
                  <input
                    type="tel"
                    value={editFormData.telefono}
                    onChange={(e) => setEditFormData({...editFormData, telefono: e.target.value})}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Comisión (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={editFormData.comision_porcentaje}
                    onChange={(e) => setEditFormData({...editFormData, comision_porcentaje: Number(e.target.value)})}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-xl">
                <label className="flex items-center gap-2 text-sm text-[var(--foreground)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.activo}
                    onChange={(e) => setEditFormData({...editFormData, activo: e.target.checked})}
                    className="rounded border-[var(--border)] w-4 h-4"
                  />
                  Vendedor activo
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted)] text-[var(--foreground)] font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-[var(--foreground)] font-bold transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
