import { create } from 'zustand';
import type { TipoEvento } from '../types/evento.types';

interface CatalogoFiltros {
  tipo?: TipoEvento;
  fechaInicioDesde?: string;
  fechaInicioHasta?: string;
}

interface CatalogoStore {
  filtros: CatalogoFiltros;
  setFiltros: (partial: Partial<CatalogoFiltros>) => void;
  resetFiltros: () => void;
}

export const useCatalogoStore = create<CatalogoStore>(set => ({
  filtros: {},
  setFiltros: partial => set(s => ({ filtros: { ...s.filtros, ...partial } })),
  resetFiltros: () => set({ filtros: {} }),
}));
