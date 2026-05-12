import { useQuery } from '@tanstack/react-query';
import { tiposAsientoService } from '../../services/tiposAsientoService';
import type { TipoAsientoFiltros } from '../../types/asiento.types';

export function useTiposAsiento(filtros: TipoAsientoFiltros = {}) {
  return useQuery({
    queryKey: ['tiposAsiento', filtros],
    queryFn: () => tiposAsientoService.getTiposAsiento(filtros),
  });
}
