import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { recintosService } from '../../services/recintosService';
import type { CrearRecintoRequest } from '../../types/recinto.types';

export function useCreateRecinto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearRecintoRequest) => recintosService.createRecinto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recintos'] });
      sileo.success({ title: 'Recinto creado', description: 'El recinto fue registrado exitosamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al crear recinto', description: 'No se pudo registrar el recinto. Intenta de nuevo.' });
    },
  });
}
