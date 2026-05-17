import { useQuery } from '@tanstack/react-query';
import { bloqueosService } from '../../services/bloqueosService';
import type { PanelFiltros } from '../../types/bloqueos.types';

export function useBloqueos(eventoId: string, filtros?: PanelFiltros) {
  return useQuery({
    queryKey: ['panel-bloqueos', eventoId, filtros],
    queryFn: () => bloqueosService.getPanel(eventoId, filtros),
    enabled: !!eventoId,
  });
}
