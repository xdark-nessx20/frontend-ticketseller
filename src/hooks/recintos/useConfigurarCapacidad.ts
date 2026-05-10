import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { recintosService } from '../../services/recintosService';
import type { ConfigurarCapacidadRequest } from '../../types/recinto.types';

export function useConfigurarCapacidad(recintoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConfigurarCapacidadRequest) =>
      recintosService.configurarCapacidad(recintoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recintos'] });
      queryClient.invalidateQueries({ queryKey: ['recintos', recintoId] });
      sileo.success({ title: 'Capacidad configurada', description: 'La capacidad del recinto fue actualizada.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al configurar capacidad', description: 'No se pudo actualizar la capacidad. Intenta de nuevo.' });
    },
  });
}
