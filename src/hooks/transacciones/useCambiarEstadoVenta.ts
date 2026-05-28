import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { transaccionesService } from '../../services/transaccionesService';
import type { CambiarEstadoVentaRequest } from '../../types/transacciones.types';

export function useCambiarEstadoVenta(ventaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CambiarEstadoVentaRequest) =>
      transaccionesService.cambiarEstadoVenta(ventaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacciones'] });
      sileo.success({ title: 'Estado actualizado', description: 'El estado de la venta fue cambiado exitosamente.' });
    },
  });
}
