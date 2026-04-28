import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para errores 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// PDF API
// ============================================

export interface PDFResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    filename: string;
  };
}

export const pdfAPI = {
  generar: async (cotizacionId: string): Promise<PDFResponse> => {
    const response = await api.post(`/pdf/cotizaciones/${cotizacionId}/pdf`);
    return response.data;
  },

  descargar: async (cotizacionId: string): Promise<Blob> => {
    const response = await api.get(`/pdf/cotizaciones/${cotizacionId}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  regenerar: async (cotizacionId: string): Promise<PDFResponse> => {
    const response = await api.put(`/pdf/cotizaciones/${cotizacionId}/pdf`);
    return response.data;
  },
};

// ============================================
// RECORDATORIOS API
// ============================================

export interface Recordatorio {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_recordatorio: string;
  estado: 'pendiente' | 'completado' | 'cancelado';
  fecha_completado: string | null;
  notificacion_enviada: boolean;
  fecha_creacion: string;
  cliente?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
  cotizacion?: {
    id: string;
    codigo: string;
    destino_principal: string;
  };
  vendedor?: {
    id: string;
    nombre: string;
    email: string;
  };
  asignado?: {
    id: string;
    nombre: string;
    email: string;
  };
}

export const recordatoriosAPI = {
  listar: async (params?: { cliente_id?: string; estado?: string; vencidos?: boolean }): Promise<Recordatorio[]> => {
    const response = await api.get('/recordatorios', { params });
    return response.data.recordatorios || [];
  },

  crear: async (data: {
    titulo: string;
    descripcion?: string;
    cliente_id?: string;
    cotizacion_id?: string;
    asignado_a?: string;
    fecha_recordatorio: string;
  }): Promise<Recordatorio> => {
    const response = await api.post('/recordatorios', data);
    return response.data.recordatorio;
  },

  actualizar: async (id: string, data: Partial<{
    titulo: string;
    descripcion: string;
    fecha_recordatorio: string;
    estado: string;
    asignado_a: string;
  }>): Promise<Recordatorio> => {
    const response = await api.put(`/recordatorios/${id}`, data);
    return response.data.recordatorio;
  },

  completar: async (id: string): Promise<Recordatorio> => {
    return recordatoriosAPI.actualizar(id, { estado: 'completado' });
  },

  eliminar: async (id: string): Promise<void> => {
    await api.delete(`/recordatorios/${id}`);
  },
};

export default api;
