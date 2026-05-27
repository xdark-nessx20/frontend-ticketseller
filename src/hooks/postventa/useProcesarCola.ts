import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { postVentaService } from '../../services/postVentaService';

export function useProcesarCola() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => postVentaService.procesarColaReembolsos(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reembolsosPendientes'] });
      sileo.success({ title: 'Cola procesada', description: 'Los reembolsos pendientes fueron procesados.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al procesar cola', description: 'No se pudo procesar la cola de reembolsos.' });
    },
  });
}
