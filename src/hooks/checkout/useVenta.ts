import { useQuery } from '@tanstack/react-query';
import { checkoutService } from '../../services/checkoutService';

export function useVenta(ventaId: string) {
  return useQuery({
    queryKey: ['venta', ventaId],
    queryFn: () => checkoutService.getVenta(ventaId),
    enabled: !!ventaId,
  });
}
