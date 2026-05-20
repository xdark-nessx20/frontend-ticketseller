import axios from 'axios';
import type {
  VentaDetalleResponse,
  ReservarAsientosRequest,
  ProcesarPagoRequest,
} from '../types/checkout.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
});

export const checkoutService = {
  async reservarAsientos(data: ReservarAsientosRequest) {
    const {eventoId, ...body} = data;
    const r = await api.post<VentaDetalleResponse>(`/eventos/${eventoId}/asientos/reservar`, body);
    return r.data;
  },

  async procesarPago(ventaId: string, data: ProcesarPagoRequest) {
    const r = await api.post<VentaDetalleResponse>(`/checkout/${ventaId}/pagar`, data);
    return r.data;
  },

  async getVenta(ventaId: string) {
    const r = await api.get<VentaDetalleResponse>(`/checkout/${ventaId}`);
    return r.data;
  },
};
