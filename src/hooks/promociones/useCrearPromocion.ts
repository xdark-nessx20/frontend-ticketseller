import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { promocionesService } from '../../services/promocionesService';
import type { CrearPromocionRequest } from '../../types/promociones.types';

export function useCrearPromocion(eventoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearPromocionRequest) => promocionesService.crearPromocion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promociones', eventoId] });
      sileo.success({ title: 'Promoción creada', description: 'La promoción fue registrada exitosamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al crear promoción', description: 'No se pudo registrar la promoción. Intenta de nuevo.' });
    },
  });
}
