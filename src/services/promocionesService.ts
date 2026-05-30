import { api } from './api';
import type {
  PromocionResponse,
  DescuentoResponse,
  DescuentoAplicadoResponse,
  CrearPromocionRequest,
  CrearDescuentoRequest,
  CrearCodigosRequest,
  ActualizarEstadoPromocionRequest,
  CodigoPromocionalResponse,
} from '../types/promociones.types';
import type { TipoUsuario } from '../types/checkout.types';

export const promocionesService = {
  async getPromociones(eventoId: string) {
    const r = await api.get<PromocionResponse[]>('/admin/promociones', {params: {eventoId}});
    return r.data;
  },

  async crearPromocion(data: CrearPromocionRequest) {
    const r = await api.post<PromocionResponse>('/admin/promociones', data);
    return r.data;
  },

  async actualizarEstado(promocionId: string, data: ActualizarEstadoPromocionRequest) {
    const r = await api.patch<PromocionResponse>(`/admin/promociones/${promocionId}/estado`, data);
    return r.data;
  },

  async crearCodigos(promocionId: string, data: CrearCodigosRequest) {
    const r = await api.post<void>(`/admin/promociones/${promocionId}/codigos`, data);
    return r.data;
  },

  async obtenerCodigos(promocionId: string) {
    const r = await api.get<CodigoPromocionalResponse[]>(`/admin/promociones/${promocionId}/codigos`);
    return r.data;
  },

  async getDescuentos(promocionId: string) {
    const r = await api.get<DescuentoResponse[]>(`/admin/promociones/${promocionId}/descuentos`);
    return r.data;
  },

  async crearDescuento(promocionId: string, data: CrearDescuentoRequest) {
    const r = await api.post<DescuentoResponse>(`/admin/promociones/${promocionId}/descuentos`, data);
    return r.data;
  },

  async calcularDescuentosCarrito(
    eventoId: string,
    tipoUsuario: TipoUsuario,
    items: { zonaId: string; precio: number }[],
  ) {
    const r = await api.post<DescuentoAplicadoResponse>('/admin/promociones/calcular-descuentos', {
      eventoId,
      tipoUsuario,
      items,
    });
    return r.data;
  },

  async aplicarCodigoPromocional(ventaId: string, codigo: string) {
    const r = await api.post<DescuentoAplicadoResponse>(`/compras/${ventaId}/aplicar-codigo`, { codigo });
    return r.data;
  },
};
