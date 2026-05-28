import { useQuery } from '@tanstack/react-query';
import { transaccionesService } from '../../services/transaccionesService';
import type { TransaccionFiltros } from '../../types/transacciones.types';

export function useTransacciones(filtros?: TransaccionFiltros) {
  return useQuery({
    queryKey: ['transacciones', filtros],
    queryFn: () => transaccionesService.getTransacciones(filtros),
  });
}
