import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { sileo } from 'sileo';
import { promocionesService } from '../../services/promocionesService';
import type { AplicarCodigoRequest } from '../../types/promociones.types';

export function useAplicarCodigo() {
  return useMutation({
    mutationFn: (data: AplicarCodigoRequest) => promocionesService.aplicarCodigo(data),
    onSuccess: () => {
      sileo.success({ title: 'Código aplicado', description: 'El descuento fue aplicado a tu carrito.' });
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        const msg: string = err.response.data?.message ?? '';
        if (msg.toLowerCase().includes('agotado') || msg.toLowerCase().includes('usado')) {
          sileo.error({ title: 'Código agotado', description: 'Este código ya alcanzó su límite de usos.' });
        } else if (msg.toLowerCase().includes('expirado') || msg.toLowerCase().includes('expirada')) {
          sileo.error({ title: 'Código expirado', description: 'Este código promocional ya venció.' });
        } else {
          sileo.error({ title: 'Código inválido', description: msg || 'El código ingresado no es válido.' });
        }
      } else {
        sileo.error({ title: 'Error al aplicar código', description: 'No se pudo procesar el código. Intenta de nuevo.' });
      }
    },
  });
}
