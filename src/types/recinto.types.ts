export type CategoriaRecinto =
  | 'ESTADIO'
  | 'TEATRO'
  | 'AUDITORIO'
  | 'SALA_CONCIERTOS'
  | 'CENTRO_CONGRESOS'
  | 'OTRO';

export type EstadoRecinto = 'ACTIVO' | 'INACTIVO';

export type TipoZona = 'GENERAL' | 'VIP' | 'PLATEA' | 'PALCO';

export interface RecintoResponse {
  id: string;
  nombre: string;
  ciudad: string;
  direccion: string;
  capacidadMaxima: number;
  telefono: string;
  fechaCreacion: string;
  compuertasIngreso: number;
  activo: boolean;
  categoria: CategoriaRecinto | null;
}

export interface ZonaResponse {
  id: string;
  recintoId: string;
  nombre: string;
  tipo: TipoZona;
  capacidad: number;
}

export interface CompuertaResponse {
  id: string;
  recintoId: string;
  zonaId: string | null;
  nombre: string;
  esGeneral: boolean;
}

export interface RecintoEstructuraResponse {
  recinto: RecintoResponse;
  zonas: ZonaResponse[];
  compuertas: CompuertaResponse[];
}

export interface CrearRecintoRequest {
  nombre: string;
  ciudad: string;
  direccion: string;
  capacidadMaxima: number;
  telefono: string;
  compuertasIngreso: number;
}

export interface EditarRecintoRequest {
  nombre?: string;
  ciudad?: string;
  direccion?: string;
  telefono?: string;
  compuertasIngreso?: number;
}

export interface ConfigurarCapacidadRequest {
  capacidadMaxima: number;
}

export interface ConfigurarCategoriaRequest {
  categoria: CategoriaRecinto;
}

export interface CrearZonaRequest {
  nombre: string;
  tipo: TipoZona;
  capacidad: number;
}

export interface CrearCompuertaRequest {
  nombre: string;
  zonaId?: string;
}

export interface RecintoFiltros {
  nombre?: string;
  ciudad?: string;
  categoria?: CategoriaRecinto;
  estado?: EstadoRecinto;
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  number: number;
  totalElements: number;
}
