export type EstadoTipoAsiento = 'ACTIVO' | 'INACTIVO';
export type EstadoAsiento = 'DISPONIBLE' | 'BLOQUEADO' | 'RESERVADO' | 'VENDIDO' | 'MANTENIMIENTO' | 'ANULADO';

export interface TipoAsientoResponse {
  id: string;
  nombre: string;
  descripcion: string | null;
  estado: EstadoTipoAsiento;
  enUso: boolean;
}

export interface AsientoResponse {
  id: string;
  fila: number;
  columna: number;
  numero: string;
  zonaId: string;
  estado: EstadoAsiento;
  existente: boolean;
}

export interface CrearTipoAsientoRequest {
  nombre: string;
  descripcion?: string;
}

export interface EditarTipoAsientoRequest {
  nombre?: string;
  descripcion?: string;
}

export interface AsignarTipoAsientoRequest {
  tipoAsientoId: string;
}

export interface AsignarAsientosZonaRequest {
  asientoIds: string[];
}

export interface CrearMapaAsientosRequest {
  filas: number;
  columnasPorFila: number;
}

export interface MarcarEspacioVacioRequest {
  existente: boolean;
}

export interface TipoAsientoFiltros {
  estado?: EstadoTipoAsiento;
}
