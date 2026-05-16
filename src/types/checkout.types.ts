export type EstadoVenta = 'PENDIENTE' | 'RESERVADA' | 'COMPLETADA' | 'EXPIRADA' | 'CANCELADA' | 'REEMBOLSADA';
export type EstadoTicket = 'USADO' | 'VENDIDO' | 'CANCELADO' | 'REEMBOLSO_PENDIENTE' | 'REEMBOLSADO' | 'ANULADO';
export type MetodoPago = 'TARJETA' | 'NEQUI' | 'DAVIPLATA' | 'PSE' | 'OTRO';
export type TipoUsuario = 'VIP' | 'GENERAL' | 'PRENSA' | 'PATROCINADOR';

export interface VentaResponse {
    id: string;
    compradorId: string;
    eventoId: string;
    estado: EstadoVenta;
    fechaCreacion: string;
    fechaExpiracion: string;
    total: number;
}

export interface TicketResponse {
    id: string;
    ventaId: string;
    eventoId: string;
    zonaId: string;
    compuertaId: string;
    codigoQR: string;
    estado: EstadoTicket;
    precio: number;
    esCortesia: boolean;
}

export interface VentaDetalleResponse extends VentaResponse {
    tickets: TicketResponse[];
}

export interface SeleccionZona {
    zonaId: string;
    zonaNombre: string;
    cantidad: number;
    precioUnitario: number;
    asientoIds?: string[];
    asientosNumeros?: string[];
}

export interface ReservarAsientosRequest {
    eventoId: string;
    compradorId: string;
    zonaId: string;
    cantidad: number;
    esCortesia?: boolean;
    asientoIds?: string[];
    tipoUsuario: TipoUsuario;
}

export interface ProcesarPagoRequest {
    metodoPago: MetodoPago;
    numeroTarjeta?: string;
    mesExpiracion?: string;
    anioExpiracion?: string;
    cvv?: string;
    titular?: string;
    ip?: string;
}
