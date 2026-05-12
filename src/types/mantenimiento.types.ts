import type { EstadoAsiento } from './asiento.types';

export type { EstadoAsiento };

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
  estado: EstadoAsiento;
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

export const TRANSICIONES_VALIDAS: Record<EstadoAsiento, EstadoAsiento[]> = {
  DISPONIBLE: ['BLOQUEADO', 'RESERVADO', 'MANTENIMIENTO'],
  BLOQUEADO: ['DISPONIBLE', 'MANTENIMIENTO'],
  RESERVADO: ['DISPONIBLE', 'VENDIDO'],
  VENDIDO: [],
  MANTENIMIENTO: ['DISPONIBLE', 'BLOQUEADO'],
  ANULADO: [],
  INACTIVO: [],
};
