import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { sileo } from 'sileo';
import { checkoutService } from '../../services/checkoutService';
import { useCarritoStore } from '../../stores/carritoStore';
import type { ReservarAsientosRequest } from '../../types/checkout.types';

export function useReservarAsientos() {
  const navigate = useNavigate();
  const setReserva = useCarritoStore(s => s.setReserva);

  return useMutation({
    mutationFn: (data: ReservarAsientosRequest) => checkoutService.reservarAsientos(data),
    onSuccess: detalle => {
      setReserva(detalle.id, detalle.fechaExpiracion);
      sileo.success({ title: 'Reserva creada', description: 'Tienes 15 minutos para completar tu compra.' });
      navigate(`/checkout/${detalle.id}`);
    },
    onError: () => {
      sileo.error({ title: 'Error al reservar', description: 'No se pudieron reservar los asientos. Intenta de nuevo.' });
    },
  });
}
