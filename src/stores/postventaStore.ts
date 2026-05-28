import { create } from 'zustand';

interface PostventaStore {
  ticketsSeleccionados: string[];
  toggleTicket: (ticketId: string) => void;
  limpiarSeleccion: () => void;
}

export const usePostventaStore = create<PostventaStore>(set => ({
  ticketsSeleccionados: [],

  toggleTicket: (ticketId) =>
    set(state => ({
      ticketsSeleccionados: state.ticketsSeleccionados.includes(ticketId)
        ? state.ticketsSeleccionados.filter(id => id !== ticketId)
        : [...state.ticketsSeleccionados, ticketId],
    })),

  limpiarSeleccion: () => set({ ticketsSeleccionados: [] }),
}));
