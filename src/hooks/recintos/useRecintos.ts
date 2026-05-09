import { useQuery } from '@tanstack/react-query';
import { recintosService } from '../../services/recintosService';
import type { RecintoFiltros } from '../../types/recinto.types';

export function useRecintos(filtros: RecintoFiltros = {}) {
  return useQuery({
    queryKey: ['recintos', filtros],
    queryFn: () => recintosService.getRecintos(filtros),
  });
}
