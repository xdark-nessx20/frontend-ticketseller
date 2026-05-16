import { useMutation } from '@tanstack/react-query';
import { promocionesService } from '../../services/promocionesService';
import type { DescuentoAplicadoResponse } from '../../types/promociones.types';

export function useAplicarCodigo(ventaId: string) {
  return useMutation<DescuentoAplicadoResponse, Error, string>({
    mutationFn: (codigo: string) => promocionesService.aplicarCodigo(ventaId, { codigo }),
  });
}
