import { create } from 'zustand';
import type { SeleccionZona } from '../types/checkout.types';

interface CarritoStore {
  ventaId: string | null;
  eventoId: string | null;
  fechaExpiracion: string | null;
  asientosSeleccionados: SeleccionZona[];
  isExpired: boolean;
  setReserva: (ventaId: string, fechaExpiracion: string) => void;
  setSeleccion: (eventoId: string, selecciones: SeleccionZona[]) => void;
  clearCarrito: () => void;
  marcarExpirado: () => void;
}

export const useCarritoStore = create<CarritoStore>(set => ({
  ventaId: null,
  eventoId: null,
  fechaExpiracion: null,
  asientosSeleccionados: [],
  isExpired: false,

  setReserva: (ventaId, fechaExpiracion) =>
    set({ ventaId, fechaExpiracion, isExpired: false }),

  setSeleccion: (eventoId, selecciones) =>
    set({ eventoId, asientosSeleccionados: selecciones }),

  clearCarrito: () =>
    set({
      ventaId: null,
      eventoId: null,
      fechaExpiracion: null,
      asientosSeleccionados: [],
      isExpired: false,
    }),

  marcarExpirado: () =>
    set({
      ventaId: null,
      fechaExpiracion: null,
      asientosSeleccionados: [],
      isExpired: true,
    }),
}));
