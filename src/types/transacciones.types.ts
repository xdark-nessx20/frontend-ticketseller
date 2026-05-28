import type { EstadoVenta } from './checkout.types';

export type EstadoConciliacion =
  | 'PENDIENTE'
  | 'VERIFICADO'
  | 'EN_DISCREPANCIA'
  | 'CONFIRMADO'
  | 'CONFIRMADO_MANUALMENTE'
  | 'EXPIRADO';

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

export interface PagoResponse {
  id: string;
  ventaId: string;
  idExternoPasarela: string | null;
  montoEsperado: number;
  montoPasarela: number;
  estado: EstadoConciliacion;
  agenteId: string | null;
  justificacionResolucion: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
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

export interface VerificarPagoRequest {
  ventaId: string;
  montoPasarela: number;
  idExternoPasarela?: string;
}

export interface ConfirmarPagoRequest {
  ventaId: string;
  idExternoPasarela: string;
  montoPasarela: number;
}

export interface ResolverDiscrepanciaRequest {
  confirmar: boolean;
  justificacion: string;
  agenteId: string;
}
