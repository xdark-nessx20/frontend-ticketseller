import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { recintosService } from '../../services/recintosService';
import type { CrearCompuertaRequest } from '../../types/recinto.types';

export function useCreateCompuerta(recintoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearCompuertaRequest) => recintosService.createCompuerta(recintoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recintos', recintoId, 'compuertas'] });
      queryClient.invalidateQueries({ queryKey: ['recintos', recintoId, 'estructura'] });
      sileo.success({ title: 'Compuerta creada', description: 'La compuerta fue registrada exitosamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al crear compuerta', description: 'No se pudo registrar la compuerta. Intenta de nuevo.' });
    },
  });
}
