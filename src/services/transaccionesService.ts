import { api } from '../api/apiClient';
import type {
  VentaResumenResponse,
  HistorialEstadoVentaResponse,
  TransaccionFiltros,
  CambiarEstadoVentaRequest,
} from '../types/transacciones.types';

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
};
