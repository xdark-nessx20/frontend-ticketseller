import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { sileo } from 'sileo';
import { checkoutService } from '../../services/checkoutService';
import { useCarritoStore } from '../../stores/carritoStore';
import type { ProcesarPagoRequest } from '../../types/checkout.types';

export function useProcesarPago(ventaId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearCarrito = useCarritoStore(s => s.clearCarrito);

  return useMutation({
    mutationFn: (data: ProcesarPagoRequest) => checkoutService.procesarPago(ventaId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(['venta', ventaId], data);
      clearCarrito();
      sileo.success({ title: 'Pago exitoso', description: 'Tus tickets fueron enviados por email.' });
      navigate(`/checkout/${ventaId}/confirmacion`);
    },
  });
}
