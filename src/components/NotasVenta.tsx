"use client";

import { User, Users, FileText, Calendar, MapPin, Phone, Mail, CreditCard } from 'lucide-react';

interface NotasVentaProps {
  notas: string;
}

interface DatosCompletos {
  cliente?: {
    nombre?: string;
    apellido?: string;
    email?: string;
    telefono?: string;
    documento?: string;
    fecha_nacimiento?: string;
    nacionalidad?: string;
    direccion?: string;
    ciudad?: string;
    notas?: string;
  };
  pasajeros?: Array<{
    nombre?: string;
    apellido?: string;
    documento?: string;
    fecha_nacimiento?: string;
    nacionalidad?: string;
    telefono?: string;
    email?: string;
  }>;
  config?: {
    num_pasajeros?: number;
    tipo_habitacion?: string;
    fecha_salida?: string;
  };
}

export default function NotasVenta({ notas }: NotasVentaProps) {
  // Función para parsear las notas y extraer secciones
  const parsearNotas = (texto: string) => {
    const secciones: { titulo: string; contenido: string; tipo: 'texto' | 'json' | 'lista' }[] = [];
    
    // Buscar DATOS COMPLETOS (JSON)
    const matchDatos = texto.match(/--- DATOS COMPLETOS ---\n([\s\S]*?)(?=\n===|$)/);
    if (matchDatos) {
      try {
        const datos: DatosCompletos = JSON.parse(matchDatos[1].trim());
        secciones.push({ titulo: 'DATOS COMPLETOS', contenido: '', tipo: 'json', datos } as any);
      } catch (e) {
        // Si no se puede parsear, lo mostramos como texto
      }
    }
    
    // Extraer otras secciones
    const lineas = texto.split('\n');
    let seccionActual = { titulo: '', contenido: '' as string | string[] };
    
    for (const linea of lineas) {
      // Detectar títulos de sección
      if (linea.startsWith('===') && linea.endsWith('===')) {
        if (seccionActual.titulo) {
          secciones.push({
            titulo: seccionActual.titulo,
            contenido: Array.isArray(seccionActual.contenido) 
              ? seccionActual.contenido.join('\n')
              : seccionActual.contenido,
            tipo: 'texto'
          });
        }
        seccionActual = { 
          titulo: linea.replace(/===/g, '').trim(), 
          contenido: [] as string[] 
        };
      } else if (linea.trim() && !linea.includes('--- DATOS COMPLETOS ---')) {
        if (Array.isArray(seccionActual.contenido)) {
          seccionActual.contenido.push(linea);
        }
      }
    }
    
    // Agregar última sección
    if (seccionActual.titulo && seccionActual.titulo !== 'DATOS COMPLETOS') {
      secciones.push({
        titulo: seccionActual.titulo,
        contenido: Array.isArray(seccionActual.contenido) 
          ? seccionActual.contenido.join('\n')
          : seccionActual.contenido,
        tipo: 'texto'
      });
    }
    
    return secciones;
  };

  const secciones = parsearNotas(notas);

  return (
    <div className="space-y-6">
      {secciones.map((seccion, idx) => {
        if (seccion.titulo === 'DATOS COMPLETOS' && seccion.tipo === 'json') {
          const datos = (seccion as any).datos as DatosCompletos;
          return (
            <div key={idx} className="space-y-6">
              {/* Datos del Cliente Principal */}
              {datos.cliente && (
                <div className="glass-card rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    Datos del Cliente
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">Nombre completo</p>
                      <p className="text-white font-medium">
                        {datos.cliente.nombre} {datos.cliente.apellido}
                      </p>
                    </div>
                    {datos.cliente.documento && (
                      <div className="p-3 bg-white/5 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">Documento</p>
                        <p className="text-white font-medium">{datos.cliente.documento}</p>
                      </div>
                    )}
                    {datos.cliente.email && (
                      <div className="p-3 bg-white/5 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> Email
                        </p>
                        <p className="text-white font-medium">{datos.cliente.email}</p>
                      </div>
                    )}
                    {datos.cliente.telefono && (
                      <div className="p-3 bg-white/5 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Teléfono
                        </p>
                        <p className="text-white font-medium">{datos.cliente.telefono}</p>
                      </div>
                    )}
                    {datos.cliente.fecha_nacimiento && (
                      <div className="p-3 bg-white/5 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Fecha de nacimiento
                        </p>
                        <p className="text-white font-medium">
                          {new Date(datos.cliente.fecha_nacimiento).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    )}
                    {datos.cliente.nacionalidad && (
                      <div className="p-3 bg-white/5 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">Nacionalidad</p>
                        <p className="text-white font-medium">{datos.cliente.nacionalidad}</p>
                      </div>
                    )}
                    {datos.cliente.ciudad && (
                      <div className="p-3 bg-white/5 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Ciudad
                        </p>
                        <p className="text-white font-medium">{datos.cliente.ciudad}</p>
                      </div>
                    )}
                    {datos.cliente.direccion && (
                      <div className="p-3 bg-white/5 rounded-xl md:col-span-2">
                        <p className="text-xs text-slate-500 mb-1">Dirección</p>
                        <p className="text-white font-medium">{datos.cliente.direccion}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Configuración del Viaje */}
              {datos.config && (
                <div className="glass-card rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-400" />
                    Configuración del Viaje
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-white/5 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">Pasajeros</p>
                      <p className="text-white font-medium text-xl">{datos.config.num_pasajeros}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">Tipo de habitación</p>
                      <p className="text-white font-medium capitalize">{datos.config.tipo_habitacion}</p>
                    </div>
                    {datos.config.fecha_salida && (
                      <div className="p-3 bg-white/5 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">Fecha de salida</p>
                        <p className="text-white font-medium">
                          {new Date(datos.config.fecha_salida).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pasajeros adicionales */}
              {datos.pasajeros && datos.pasajeros.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    Pasajeros ({datos.pasajeros.length})
                  </h4>
                  <div className="space-y-3">
                    {datos.pasajeros.map((pasajero, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-blue-400 font-bold text-sm">{i + 1}</span>
                          </div>
                          <p className="text-white font-medium">
                            {pasajero.nombre} {pasajero.apellido}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          {pasajero.documento && (
                            <div>
                              <span className="text-slate-500">Doc:</span>{' '}
                              <span className="text-slate-300">{pasajero.documento}</span>
                            </div>
                          )}
                          {pasajero.fecha_nacimiento && (
                            <div>
                              <span className="text-slate-500">Nac:</span>{' '}
                              <span className="text-slate-300">
                                {new Date(pasajero.fecha_nacimiento).toLocaleDateString('es-AR')}
                              </span>
                            </div>
                          )}
                          {pasajero.nacionalidad && (
                            <div>
                              <span className="text-slate-500">Nac:</span>{' '}
                              <span className="text-slate-300">{pasajero.nacionalidad}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }

        // Otras secciones (Pago, Comprobantes, etc.)
        return (
          <div key={idx} className="glass-card rounded-2xl p-6">
            <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              {seccion.titulo}
            </h4>
            <div className="text-slate-300 whitespace-pre-wrap">
              {seccion.contenido}
            </div>
          </div>
        );
      })}
    </div>
  );
}
