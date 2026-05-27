import { useQuery } from '@tanstack/react-query';
import { postVentaService } from '../../services/postVentaService';

export function useMisCompras() {
  return useQuery({
    queryKey: ['misCompras'],
    queryFn: () => postVentaService.getMisCompras(),
  });
}
