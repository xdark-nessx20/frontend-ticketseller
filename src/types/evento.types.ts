export type EstadoEvento = 'ACTIVO' | 'EN_PROGRESO' | 'FINALIZADO' | 'CANCELADO';
export type TipoEvento = string;

export interface EventoResponse {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  tipo: TipoEvento;
  recintoId: string;
  estado: EstadoEvento;
  motivoCancelacion: string | null;
}

export interface PrecioZonaResponse {
  id: string;
  eventoId: string;
  zonaId: string;
  zonaNombre: string;
  precio: number;
}

export interface CrearEventoRequest {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  tipo: string;
  recintoId: string;
}

export interface EditarEventoRequest {
  nombre?: string;
  fechaInicio?: string;
  fechaFin?: string;
  tipo?: string;
}

export interface CancelarEventoRequest {
  motivo: string;
}

export interface PrecioZonaRequest {
  zonaId: string;
  precio: number;
}

export interface ConfigurarPreciosRequest {
  precios: PrecioZonaRequest[];
}

export interface EventoFiltros {
  estado?: EstadoEvento;
}
