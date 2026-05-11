import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { tiposAsientoService } from '../../services/tiposAsientoService';

export function useDesactivarTipoAsiento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tiposAsientoService.desactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposAsiento'] });
      sileo.warning({ title: 'Tipo desactivado', description: 'El tipo de asiento ya no está disponible para asignación.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al desactivar', description: 'No se pudo desactivar el tipo de asiento.' });
    },
  });
}
