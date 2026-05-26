import type { EstadoAsiento } from './asiento.types';

export type { EstadoAsiento };

// Estado calculado por evento que devuelve la API para visualización
export type EstadoAsientoDisplay = EstadoAsiento | 'RESERVADO' | 'VENDIDO' | 'BLOQUEADO';

export interface HistorialCambioResponse {
  fechaHora: string;
  usuario: string;
  estadoAnterior: EstadoAsiento;
  estadoNuevo: EstadoAsiento;
  motivo: string | null;
}

export interface CambiarEstadoMasivoResponse {
  modificados: number;
  omitidos: number;
  mensajes: string[];
}

export interface AsientoConEstadoResponse {
  id: string;
  numero: string;
  fila: number;
  columna: number;
  zonaId: string;
  estado: EstadoAsientoDisplay;
}

export interface CambiarEstadoRequest {
  estadoDestino: EstadoAsiento;
  motivo?: string;
}

export interface CambiarEstadoMasivoRequest {
  asientoIds: string[];
  estadoDestino: EstadoAsiento;
  motivo?: string;
}

export const TRANSICIONES_VALIDAS: Partial<Record<EstadoAsientoDisplay, EstadoAsiento[]>> = {
  DISPONIBLE: ['MANTENIMIENTO', 'INACTIVO'],
  MANTENIMIENTO: ['DISPONIBLE', 'INACTIVO'],
  INACTIVO: [],
};
