export type TipoPromocion = 'PREVENTA' | 'DESCUENTO' | 'CODIGOS';
export type EstadoPromocion = 'ACTIVA' | 'PAUSADA' | 'FINALIZADA';
export type TipoDescuento = 'PORCENTAJE' | 'MONTO_FIJO';
export type EstadoCodigoPromocional = 'ACTIVO' | 'AGOTADO' | 'EXPIRADO';
export type TipoUsuario = 'VIP' | 'GENERAL' | 'PRENSA' | 'PATROCINADOR';

export interface PromocionResponse {
  id: string;
  nombre: string;
  tipo: TipoPromocion;
  eventoId: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoPromocion;
  tipoUsuarioRestringido: TipoUsuario | null;
}

export interface CodigoPromocionalResponse {
  codigo: string;
  usosMaximos: number;
  usosActuales: number;
  fechaFin: string;
  estado: EstadoCodigoPromocional;
}

export interface DescuentoResponse {
  id: string;
  promocionId: string;
  promocionNombre: string;
  tipo: TipoDescuento;
  valor: number;
  zonaId: string | null;
  acumulable: boolean;
}

export interface DescuentoAplicadoResponse {
  descuentoId: string;
  tipo: TipoDescuento;
  valor: number;
  montoDescuento: number;
  totalConDescuento: number;
}

export interface CrearPromocionRequest {
  nombre: string;
  tipo: TipoPromocion;
  eventoId: string;
  fechaInicio: string;
  fechaFin: string;
  tipoUsuarioRestringido?: TipoUsuario;
}

export interface CrearDescuentoRequest {
  tipo: TipoDescuento;
  valor: number;
  zonaId?: string;
  acumulable?: boolean;
}

export interface CrearCodigosRequest {
  cantidad: number;
  usosMaximosPorCodigo?: number;
  prefijo?: string;
  fechaFin: string;
}

export interface AplicarCodigoRequest {
  codigo: string;
}

export interface ActualizarEstadoPromocionRequest {
  estado: EstadoPromocion;
}
