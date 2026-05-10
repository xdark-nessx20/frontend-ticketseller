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
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
});

export const eventoService = {
  getEventos(filtros: EventoFiltros = {}) {
    return api.get<EventoResponse[]>('/eventos', { params: filtros }).then(r => r.data);
  },

  getEvento(eventoId: string) {
    return api.get<EventoResponse>(`/eventos/${eventoId}`).then(r => r.data);
  },

  crearEvento(data: CrearEventoRequest) {
    return api.post<EventoResponse>('/eventos', data).then(r => r.data);
  },

  editarEvento(eventoId: string, data: EditarEventoRequest) {
    return api.put<EventoResponse>(`/eventos/${eventoId}`, data).then(r => r.data);
  },

  iniciarEvento(eventoId: string) {
    return api.patch<EventoResponse>(`/eventos/${eventoId}/iniciar`).then(r => r.data);
  },

  finalizarEvento(eventoId: string) {
    return api.patch<EventoResponse>(`/eventos/${eventoId}/finalizar`).then(r => r.data);
  },

  cancelarEvento(eventoId: string, data: CancelarEventoRequest) {
    return api.delete<EventoResponse>(`/eventos/${eventoId}/cancelar`, { data }).then(r => r.data);
  },

  getPrecios(eventoId: string) {
    return api.get<PrecioZonaResponse[]>(`/eventos/${eventoId}/precios`).then(r => r.data);
  },

  configurarPrecios(eventoId: string, data: ConfigurarPreciosRequest) {
    return api.post<PrecioZonaResponse[]>(`/eventos/${eventoId}/precios`, data).then(r => r.data);
  },
};
