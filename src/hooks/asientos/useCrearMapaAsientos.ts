import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { tiposAsientoService } from '../../services/tiposAsientoService';
import type { CrearMapaAsientosRequest } from '../../types/asiento.types';

export function useCrearMapaAsientos(recintoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearMapaAsientosRequest) =>
      tiposAsientoService.crearMapaAsientos(recintoId, data),
    onSuccess: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['recintos', recintoId, 'mapa'] });
      queryClient.setQueryData(['recintos', recintoId, 'mapa'], data);
      sileo.success({ title: 'Mapa creado', description: 'El mapa de asientos fue generado exitosamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al crear mapa', description: 'No se pudo generar el mapa de asientos.' });
    },
  });
}
