export type EstadoEvento = 'ACTIVO' | 'EN_PROGRESO' | 'FINALIZADO' | 'CANCELADO';
export type TipoEvento = 'CONCIERTO' | 'PARTIDO' | 'OBRA_TEATRO' | 'FESTIVAL' | 'CONFERENCIA' | 'OTRO';

export interface EventoResponse {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  tipo: TipoEvento;
  recintoId: string;
  nombreRecinto: string;
  estado: EstadoEvento;
  motivoCancelacion: string | null;
  reingresoHabilitado: boolean;
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
  reingresoHabilitado?: boolean;
}

export interface EditarEventoRequest {
  nombre?: string;
  fechaInicio?: string;
  fechaFin?: string;
  tipo?: string;
  reingresoHabilitado?: boolean;
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
  tipo?: TipoEvento;
  fechaInicioDesde?: string;
  fechaInicioHasta?: string;
}
