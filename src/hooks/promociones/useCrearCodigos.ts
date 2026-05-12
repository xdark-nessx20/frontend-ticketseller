import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { promocionesService } from '../../services/promocionesService';
import type { CrearCodigosRequest } from '../../types/promociones.types';

export function useCrearCodigos(promocionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearCodigosRequest) => promocionesService.crearCodigos(promocionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promociones'] });
      sileo.success({ title: 'Códigos generados', description: 'Los códigos promocionales fueron creados exitosamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al generar códigos', description: 'No se pudieron generar los códigos. Intenta de nuevo.' });
    },
  });
}
