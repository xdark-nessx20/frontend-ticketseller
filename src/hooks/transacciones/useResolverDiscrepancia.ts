import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { transaccionesService } from '../../services/transaccionesService';
import type { ResolverDiscrepanciaRequest } from '../../types/transacciones.types';

export function useResolverDiscrepancia(pagoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ResolverDiscrepanciaRequest) =>
      transaccionesService.resolverDiscrepancia(pagoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discrepancias'] });
      queryClient.invalidateQueries({ queryKey: ['transacciones'] });
      sileo.success({ title: 'Discrepancia resuelta', description: 'El pago fue procesado correctamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error', description: 'No se pudo resolver la discrepancia.' });
    },
  });
}
