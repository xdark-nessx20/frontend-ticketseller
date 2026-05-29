import axios from 'axios';
import type {
  VentaResumenResponse,
  HistorialEstadoVentaResponse,
  PagoResponse,
  TransaccionFiltros,
  CambiarEstadoVentaRequest,
  ResolverDiscrepanciaRequest,
} from '../types/transacciones.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
});

export const transaccionesService = {
  async getTransacciones(filtros?: TransaccionFiltros): Promise<VentaResumenResponse[]> {
    const { data } = await api.get<VentaResumenResponse[]>('/admin/ventas', { params: filtros });
    return data;
  },

  async getHistorialVenta(ventaId: string): Promise<HistorialEstadoVentaResponse[]> {
    const { data } = await api.get<HistorialEstadoVentaResponse[]>(`/admin/ventas/${ventaId}/historial`);
    return data;
  },

  async cambiarEstadoVenta(ventaId: string, body: CambiarEstadoVentaRequest): Promise<VentaResumenResponse> {
    const { data } = await api.patch<VentaResumenResponse>(`/admin/ventas/${ventaId}/estado`, body);
    return data;
  },

  async getDiscrepancias(): Promise<PagoResponse[]> {
    const { data } = await api.get<PagoResponse[]>('/admin/conciliacion/discrepancias');
    return data;
  },

  async resolverDiscrepancia(pagoId: string, body: ResolverDiscrepanciaRequest): Promise<PagoResponse> {
    const { data } = await api.patch<PagoResponse>(`/admin/conciliacion/discrepancias/${pagoId}/resolver`, body);
    return data;
  },
};
