import api from './api';

export interface Cliente {
  id: string;
  tipo_documento: string;
  documento: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  telefono_alt: string | null;
  fecha_nacimiento: string | null;
  nacionalidad: string;
  direccion: string | null;
  ciudad: string | null;
  pais: string;
  fecha_registro: string;
  fecha_ultima_interaccion: string | null;
  estado: string;
  notas_crm: string | null;
}

export interface Pasajero {
  id: string;
  cliente_titular_id: string;
  tipo_documento: string;
  documento: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string | null;
  nacionalidad: string;
  es_cliente_registrado: boolean;
  cliente_id: string | null;
  notas: string | null;
}

export interface ClienteInput {
  tipo_documento?: string;
  documento?: string;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  telefono_alt?: string;
  fecha_nacimiento?: string;
  nacionalidad?: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  notas_crm?: string;
}

export interface BuscarClienteResult {
  id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  tipo_documento: string;
  documento: string;
}

export const clientesAPI = {
  // Listar clientes con paginación
  listar: async (params?: { q?: string; page?: number; limit?: number }) => {
    const response = await api.get('/clientes', { params });
    return response.data;
  },

  // Buscar clientes (para autocompletar)
  buscar: async (query: string): Promise<{ data: BuscarClienteResult[] }> => {
    const response = await api.get('/clientes/buscar', { params: { q: query } });
    return response.data;
  },

  // Obtener cliente por ID con detalles
  obtener: async (id: string): Promise<{
    cliente: Cliente;
    pasajeros: Pasajero[];
    historial: any[];
    cotizaciones: any[];
  }> => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },

  // Crear nuevo cliente
  crear: async (data: ClienteInput): Promise<{ message: string; cliente: Cliente; pasajero_titular: Pasajero | null }> => {
    const response = await api.post('/clientes', data);
    return response.data;
  },

  // Actualizar cliente
  actualizar: async (id: string, data: Partial<ClienteInput>): Promise<{ message: string; cliente: Cliente }> => {
    const response = await api.put(`/clientes/${id}`, data);
    return response.data;
  },

  // Obtener pasajeros de un cliente
  getPasajeros: async (clienteId: string): Promise<{ data: Pasajero[] }> => {
    const response = await api.get(`/clientes/${clienteId}/pasajeros`);
    return response.data;
  },

  // Agregar pasajero a cliente
  agregarPasajero: async (clienteId: string, data: {
    tipo_documento?: string;
    documento?: string;
    nombre: string;
    apellido: string;
    fecha_nacimiento?: string;
    nacionalidad?: string;
    notas?: string;
  }): Promise<{ message: string; pasajero: Pasajero }> => {
    const response = await api.post(`/clientes/${clienteId}/pasajeros`, data);
    return response.data;
  }
};

export default clientesAPI;
