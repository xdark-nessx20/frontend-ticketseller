export type EstadoVenta = 'PENDIENTE' | 'RESERVADA' | 'COMPLETADA' | 'EXPIRADA' | 'CANCELADA' | 'REEMBOLSADA';
export type EstadoTicket = 'USADO' | 'VENDIDO' | 'CANCELADO' | 'REEMBOLSO_PENDIENTE' | 'REEMBOLSADO' | 'ANULADO';
export type MetodoPago = 'TARJETA' | 'NEQUI' | 'DAVIPLATA' | 'PSE' | 'OTRO';

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

export interface VentaDetalleResponse {
    venta: VentaResponse;
    tickets: TicketResponse[];
}

export interface SeleccionZona {
    zonaId: string;
    zonaNombre: string;
    cantidad: number;
    precioUnitario: number;
}

export interface ReservarAsientosRequest {
    eventoId: string;
    zonaId: string;
    cantidad: number;
    asientoIds?: string[];
}

export interface ProcesarPagoRequest {
    metodoPago: MetodoPago;
    numeroTarjeta?: string;
    mesExpiracion?: string;
    anioExpiracion?: string;
    cvv?: string;
    titular?: string;
}
