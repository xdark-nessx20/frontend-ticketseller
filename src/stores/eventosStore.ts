import { create } from 'zustand';
import type { EstadoEvento, EventoFiltros } from '../types/evento.types';

interface EventosStore {
  filtros: EventoFiltros;
  setFiltroEstado: (estado: EstadoEvento | undefined) => void;
  resetFiltros: () => void;
}

export const useEventosStore = create<EventosStore>(set => ({
  filtros: {},

  setFiltroEstado: estado =>
    set({ filtros: estado ? { estado } : {} }),

  resetFiltros: () => set({ filtros: {} }),
}));
