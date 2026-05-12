import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { promocionesService } from '../../services/promocionesService';
import type { CrearDescuentoRequest } from '../../types/promociones.types';

export function useCrearDescuento(promocionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearDescuentoRequest) => promocionesService.crearDescuento(promocionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['descuentos', promocionId] });
      sileo.success({ title: 'Descuento creado', description: 'El descuento fue agregado exitosamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al crear descuento', description: 'No se pudo agregar el descuento. Intenta de nuevo.' });
    },
  });
}
