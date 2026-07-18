"use client";

import { useState, useRef } from 'react';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Upload, X, ImageIcon } from 'lucide-react';

// Componente reutilizable para subir imágenes a Supabase Storage
// Mismo patrón que el uploader de paquetes: POST /upload/paquete-imagen (campo 'imagen')
export default function ImagenUploader({
  imagenUrl,
  onImagenSubida,
  label = 'Imagen de Portada',
}: {
  imagenUrl: string;
  onImagenSubida: (url: string) => void;
  label?: string;
}) {
  const { error: toastError } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toastError('Solo se permiten archivos de imagen (JPG, PNG, WebP)', 'Archivo inválido');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      toastError('La imagen no debe superar los 5MB', 'Archivo muy grande');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('imagen', file);

      const res = await api.post('/upload/paquete-imagen', formData);

      onImagenSubida(res.data.url);
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Error al subir la imagen', 'Error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onImagenSubida('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {label && <label className="text-sm text-[var(--muted-foreground)] mb-1 block">{label}</label>}

      {imagenUrl ? (
        <div className="relative inline-block">
          <img
            src={imagenUrl}
            alt="Preview"
            className="h-48 rounded-xl object-cover border border-[var(--border)]"
          />
          <button
            type="button"
            onClick={handleRemove}
            title="Quitar"
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="h-48 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-blue-500/50 bg-[var(--muted)] transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
        >
          {isUploading ? (
            <>
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-[var(--muted-foreground)]">Subiendo...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-sm text-[var(--foreground)] font-medium">Click para subir imagen</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">JPG, PNG o WebP (máx. 5MB)</p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {imagenUrl && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Cambiar imagen
        </button>
      )}
    </div>
  );
}
