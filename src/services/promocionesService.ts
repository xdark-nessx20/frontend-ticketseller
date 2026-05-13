import axios from 'axios';
import type {
  PromocionResponse,
  DescuentoResponse,
  DescuentoAplicadoResponse,
  CrearPromocionRequest,
  CrearDescuentoRequest,
  CrearCodigosRequest,
  AplicarCodigoRequest,
  ActualizarEstadoPromocionRequest, CodigoPromocionalResponse,
} from '../types/promociones.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
});

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

  async aplicarCodigo(data: AplicarCodigoRequest) {
    const r = await api.post<DescuentoAplicadoResponse>('/compras/carrito/aplicar-codigo', data);
    return r.data;
  },
};
