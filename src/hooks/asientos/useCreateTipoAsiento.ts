import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { tiposAsientoService } from '../../services/tiposAsientoService';
import type { CrearTipoAsientoRequest } from '../../types/asiento.types';

export function useCreateTipoAsiento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearTipoAsientoRequest) => tiposAsientoService.createTipoAsiento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposAsiento'] });
      sileo.success({ title: 'Tipo creado', description: 'El tipo de asiento fue creado exitosamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al crear', description: 'No se pudo crear el tipo de asiento.' });
    },
  });
}
