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

export default api;
