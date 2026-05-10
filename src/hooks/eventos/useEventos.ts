import { useQuery } from '@tanstack/react-query';
import { eventoService } from '../../services/eventoService';
import type { EventoFiltros } from '../../types/evento.types';

export function useEventos(filtros: EventoFiltros = {}) {
  return useQuery({
    queryKey: ['eventos', filtros],
    queryFn: () => eventoService.getEventos(filtros),
  });
}
