import { useQuery } from '@tanstack/react-query';
import { postVentaService } from '../../services/postVentaService';

export function useReembolsosPendientes() {
  return useQuery({
    queryKey: ['reembolsosPendientes'],
    queryFn: () => postVentaService.getReembolsosPendientes(),
  });
}
