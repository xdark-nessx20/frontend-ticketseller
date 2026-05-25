import { create } from 'zustand';
import type { SeleccionZona, TipoUsuario } from '../types/checkout.types';

interface CarritoStore {
  ventaId: string | null;
  eventoId: string | null;
  fechaExpiracion: string | null;
  asientosSeleccionados: SeleccionZona[];
  tipoUsuario: TipoUsuario | null;
  isExpired: boolean;
  setReserva: (ventaId: string, fechaExpiracion: string) => void;
  setSeleccion: (eventoId: string, selecciones: SeleccionZona[], tipoUsuario: TipoUsuario) => void;
  clearCarrito: () => void;
  marcarExpirado: () => void;
}

export const useCarritoStore = create<CarritoStore>(set => ({
  ventaId: null,
  eventoId: null,
  fechaExpiracion: null,
  asientosSeleccionados: [],
  tipoUsuario: null,
  isExpired: false,

  setReserva: (ventaId, fechaExpiracion) =>
    set({ ventaId, fechaExpiracion, isExpired: false }),

  setSeleccion: (eventoId, selecciones, tipoUsuario) =>
    set({ eventoId, asientosSeleccionados: selecciones, tipoUsuario }),

  clearCarrito: () =>
    set({
      ventaId: null,
      eventoId: null,
      fechaExpiracion: null,
      asientosSeleccionados: [],
      tipoUsuario: null,
      isExpired: false,
    }),

  marcarExpirado: () =>
    set({
      ventaId: null,
      eventoId: null,
      fechaExpiracion: null,
      asientosSeleccionados: [],
      tipoUsuario: null,
      isExpired: true,
    }),
}));
