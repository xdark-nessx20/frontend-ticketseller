import { useQuery } from '@tanstack/react-query';
import { transaccionesService } from '../../services/transaccionesService';

export function useHistorialVenta(ventaId: string | null) {
  return useQuery({
    queryKey: ['historial-venta', ventaId],
    queryFn: () => transaccionesService.getHistorialVenta(ventaId!),
    enabled: ventaId !== null,
  });
}
