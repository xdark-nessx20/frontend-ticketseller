export type EstadoBloqueo = 'ACTIVO' | 'LIBERADO';
export type EstadoCortesia = 'GENERADA' | 'USADA' | 'NO_USADA';
export type CategoriaCortesia = 'PRENSA' | 'ARTISTA' | 'PATROCINADOR' | 'OTRO';
export type TipoPanelItem = 'BLOQUEO' | 'CORTESIA';

export interface BloqueoResponse {
  bloqueoId: string;
  asientoIds: string[];
  destinatario: string;
  estado: EstadoBloqueo;
  fechaCreacion: string;
  fechaExpiracion: string | null;
}

export interface CortesiaResponse {
  cortesiaId: string;
  codigoUnico: string;
  destinatario: string;
  categoria: CategoriaCortesia;
  asientoId: string | null;
  ticketId: string | null;
  estado: EstadoCortesia;
}

export interface PanelItemResponse {
  tipo: TipoPanelItem;
  id: string;
  asientoId: string | null;
  destinatario: string;
  estado: string;
  fechaCreacion?: string;
}

export interface PanelFiltros {
  tipo?: TipoPanelItem;
  estado?: string;
}

export interface BloquearAsientosRequest {
  asientoIds: string[];
  destinatario: string;
  fechaExpiracion?: string;
}

export interface CrearCortesiaRequest {
  destinatario: string;
  categoria: CategoriaCortesia;
  asientoId?: string;
}

export interface EditarBloqueoRequest {
  destinatario: string;
}
