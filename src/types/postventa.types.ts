export type EstadoReembolso = 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'FALLIDO';
export type TipoReembolso = 'TOTAL' | 'PARCIAL';

export interface ReembolsoResponse {
  reembolsoId: string;
  estado: EstadoReembolso;
  monto: number;
  agenteId: string | null;
  fechaCompletado: string | null;
}

export interface CancelacionResponse {
  ticketsCancelados: number;
  reembolsoId: string;
  montoPendiente: number;
}

export interface TicketConReembolsoResponse {
  id: string;
  ventaId: string;
  eventoId: string;
  eventoNombre: string;
  zonaId: string;
  zonaNombre: string;
  numeroAsiento: string;
  estado: string;
  precio: number;
  esCortesia: boolean;
  estadoReembolso: EstadoReembolso | null;
  detalleReembolso: ReembolsoResponse | null;
}

export interface CancelarTicketRequest {
  ticketIds: string[];
}

export interface CambiarEstadoTicketRequest {
  estado: string;
  justificacion: string;
}

export interface ReembolsoManualRequest {
  tipo: TipoReembolso;
  monto?: number;
}

export interface ReembolsoAdminResponse {
  reembolsoId: string;
  ticketId: string;
  estadoTicket: string;
  eventoNombre: string;
  zonaNombre: string;
  numeroAsiento: string;
  monto: number;
  estado: EstadoReembolso;
  fechaSolicitud: string;
  fechaCompletado: string | null;
  agenteId: string | null;
}
