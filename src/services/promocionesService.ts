import axios from 'axios';
import type {
  PromocionResponse,
  DescuentoResponse,
  DescuentoAplicadoResponse,
  CrearPromocionRequest,
  CrearDescuentoRequest,
  CrearCodigosRequest,
  AplicarCodigoRequest,
  ActualizarEstadoPromocionRequest,
} from '../types/promociones.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
});

export const promocionesService = {
  getPromociones(eventoId: string) {
    return api.get<PromocionResponse[]>('/admin/promociones', { params: { eventoId } }).then(r => r.data);
  },

  crearPromocion(data: CrearPromocionRequest) {
    return api.post<PromocionResponse>('/admin/promociones', data).then(r => r.data);
  },

  actualizarEstado(promocionId: string, data: ActualizarEstadoPromocionRequest) {
    return api.patch<PromocionResponse>(`/admin/promociones/${promocionId}/estado`, data).then(r => r.data);
  },

  crearCodigos(promocionId: string, data: CrearCodigosRequest) {
    return api.post<void>(`/admin/promociones/${promocionId}/codigos`, data).then(r => r.data);
  },

  getDescuentos(promocionId: string) {
    return api.get<DescuentoResponse[]>(`/admin/promociones/${promocionId}/descuentos`).then(r => r.data);
  },

  crearDescuento(promocionId: string, data: CrearDescuentoRequest) {
    return api.post<DescuentoResponse>(`/admin/promociones/${promocionId}/descuentos`, data).then(r => r.data);
  },

  aplicarCodigo(data: AplicarCodigoRequest) {
    return api.post<DescuentoAplicadoResponse>('/compras/carrito/aplicar-codigo', data).then(r => r.data);
  },
};
