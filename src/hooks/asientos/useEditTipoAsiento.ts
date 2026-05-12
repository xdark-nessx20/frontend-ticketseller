import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { tiposAsientoService } from '../../services/tiposAsientoService';
import type { EditarTipoAsientoRequest } from '../../types/asiento.types';

export function useEditTipoAsiento(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditarTipoAsientoRequest) => tiposAsientoService.editTipoAsiento(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposAsiento'] });
      sileo.success({ title: 'Tipo actualizado', description: 'El tipo de asiento fue actualizado exitosamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al actualizar', description: 'No se pudo actualizar el tipo de asiento.' });
    },
  });
}
