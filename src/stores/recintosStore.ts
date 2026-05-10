import { create } from 'zustand';
import type { RecintoFiltros } from '../types/recinto.types';

interface RecintosStore {
  filtros: RecintoFiltros;
  setFiltro: <K extends keyof RecintoFiltros>(key: K, value: RecintoFiltros[K]) => void;
  resetFiltros: () => void;
  setPage: (page: number) => void;
}

const initialFiltros: RecintoFiltros = {
  nombre: undefined,
  ciudad: undefined,
  categoria: undefined,
  estado: undefined,
  page: 0,
  size: 25,
};

export const useRecintosStore = create<RecintosStore>(set => ({
  filtros: initialFiltros,

  setFiltro: (key, value) =>
    set(state => ({
      filtros: { ...state.filtros, [key]: value, page: key !== 'page' ? 0 : state.filtros.page },
    })),

  resetFiltros: () => set({ filtros: initialFiltros }),

  setPage: (page: number) =>
    set(state => ({ filtros: { ...state.filtros, page } })),
}));
