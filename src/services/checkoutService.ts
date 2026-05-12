import axios from 'axios';
import type {
  VentaDetalleResponse,
  ReservarAsientosRequest,
  ProcesarPagoRequest,
} from '../types/checkout.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
});

export const checkoutService = {
  reservarAsientos(data: ReservarAsientosRequest) {
    return api.post<VentaDetalleResponse>('/checkout/reservar', data).then(r => r.data);
  },

  procesarPago(ventaId: string, data: ProcesarPagoRequest) {
    return api.post<VentaDetalleResponse>(`/checkout/${ventaId}/pagar`, data).then(r => r.data);
  },

  getVenta(ventaId: string) {
    return api.get<VentaDetalleResponse>(`/checkout/${ventaId}`).then(r => r.data);
  },
};
