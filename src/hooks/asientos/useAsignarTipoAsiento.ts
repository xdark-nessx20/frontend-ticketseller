import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { tiposAsientoService } from '../../services/tiposAsientoService';
import type { AsignarTipoAsientoRequest } from '../../types/asiento.types';

interface AsignarParams {
  recintoId: string;
  zonaId: string;
  data: AsignarTipoAsientoRequest;
}

export function useAsignarTipoAsiento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recintoId, zonaId, data }: AsignarParams) =>
      tiposAsientoService.asignarAZona(recintoId, zonaId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recintos', variables.recintoId, 'zonas'] });
      queryClient.invalidateQueries({ queryKey: ['recintos', variables.recintoId, 'estructura'] });
      sileo.success({ title: 'Tipo asignado', description: 'El tipo de asiento fue asignado a la zona exitosamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al asignar', description: 'No se pudo asignar el tipo de asiento a la zona.' });
    },
  });
}
