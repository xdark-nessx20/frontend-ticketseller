import axios from 'axios';
import type {
  EventoResponse,
  PrecioZonaResponse,
  CrearEventoRequest,
  EditarEventoRequest,
  CancelarEventoRequest,
  ConfigurarPreciosRequest,
  EventoFiltros,
} from '../types/evento.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
});

export const eventoService = {
  async getEventos(filtros: EventoFiltros = {}) {
    const r = await api.get<EventoResponse[]>('/eventos', {params: filtros});
    return r.data;
  },

  async getEvento(eventoId: string) {
    const r = await api.get<EventoResponse>(`/eventos/${eventoId}`);
    return r.data;
  },

  async crearEvento(data: CrearEventoRequest) {
    const r = await api.post<EventoResponse>('/eventos', data);
    return r.data;
  },

  async editarEvento(eventoId: string, data: EditarEventoRequest) {
    const r = await api.put<EventoResponse>(`/eventos/${eventoId}`, data);
    return r.data;
  },

  async iniciarEvento(eventoId: string) {
    const r = await api.patch<EventoResponse>(`/eventos/${eventoId}/iniciar`);
    return r.data;
  },

  async finalizarEvento(eventoId: string) {
    const r = await api.patch<EventoResponse>(`/eventos/${eventoId}/finalizar`);
    return r.data;
  },

  async cancelarEvento(eventoId: string, data: CancelarEventoRequest) {
    const r = await api.delete<EventoResponse>(`/eventos/${eventoId}/cancelar`, {data});
    return r.data;
  },

  async getPrecios(eventoId: string) {
    const r = await api.get<PrecioZonaResponse[]>(`/eventos/${eventoId}/precios`);
    return r.data;
  },

  async configurarPrecios(eventoId: string, data: ConfigurarPreciosRequest) {
    const r = await api.post<PrecioZonaResponse[]>(`/eventos/${eventoId}/precios`, data);
    return r.data;
  },
};
