import { useQuery } from '@tanstack/react-query';
import { transaccionesService } from '../../services/transaccionesService';

export function useDiscrepancias() {
  return useQuery({
    queryKey: ['discrepancias'],
    queryFn: () => transaccionesService.getDiscrepancias(),
  });
}
