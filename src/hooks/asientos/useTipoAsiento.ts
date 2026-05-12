import { useQuery } from '@tanstack/react-query';
import { tiposAsientoService } from '../../services/tiposAsientoService';

export function useTipoAsiento(id: string) {
  return useQuery({
    queryKey: ['tiposAsiento', id],
    queryFn: () => tiposAsientoService.getTipoAsiento(id),
    enabled: !!id,
  });
}
