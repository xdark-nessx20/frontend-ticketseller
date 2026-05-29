import { create } from 'zustand';
import type { TransaccionFiltros } from '../types/transacciones.types';

interface TransaccionesStore {
  filtros: TransaccionFiltros;
  setFiltro: <K extends keyof TransaccionFiltros>(key: K, value: TransaccionFiltros[K]) => void;
  resetFiltros: () => void;
  setPage: (page: number) => void;
}

const initialFiltros: TransaccionFiltros = {
  estado: undefined,
  eventoId: undefined,
  fechaDesde: undefined,
  fechaHasta: undefined,
  page: 0,
  size: 20,
};

export const useTransaccionesStore = create<TransaccionesStore>(set => ({
  filtros: initialFiltros,

  setFiltro: (key, value) =>
    set(state => ({
      filtros: { ...state.filtros, [key]: value, page: key !== 'page' ? 0 : state.filtros.page },
    })),

  resetFiltros: () => set({ filtros: initialFiltros }),

  setPage: (page: number) =>
    set(state => ({ filtros: { ...state.filtros, page } })),
}));
