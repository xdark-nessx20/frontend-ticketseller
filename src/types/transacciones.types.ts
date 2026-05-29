import type { EstadoVenta } from './checkout.types';

export interface HistorialEstadoVentaResponse {
  id: string;
  ventaId: string;
  estadoAnterior: string;
  estadoNuevo: string;
  actorId: string;
  fechaCambio: string;
  justificacion: string | null;
}

export interface VentaResumenResponse {
  id: string;
  compradorId: string;
  eventoId: string;
  estado: EstadoVenta;
  total: number;
  fechaCreacion: string;
  fechaExpiracion: string;
}

export interface TransaccionFiltros {
  estado?: EstadoVenta;
  eventoId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  size?: number;
}

export interface CambiarEstadoVentaRequest {
  nuevoEstado: EstadoVenta;
  justificacion: string;
}
