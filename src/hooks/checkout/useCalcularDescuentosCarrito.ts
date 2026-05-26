import { useQuery } from '@tanstack/react-query';
import { promocionesService } from '../../services/promocionesService';
import { useCarritoStore } from '../../stores/carritoStore';

export function useCalcularDescuentosCarrito(eventoId: string) {
  const asientosSeleccionados = useCarritoStore(s => s.asientosSeleccionados);
  const tipoUsuario = useCarritoStore(s => s.tipoUsuario);

  const items = asientosSeleccionados.flatMap(s =>
    Array.from({ length: s.cantidad }, () => ({ zonaId: s.zonaId, precio: s.precioUnitario })),
  );

  return useQuery({
    queryKey: ['descuentos-carrito', eventoId, tipoUsuario, JSON.stringify(items)],
    queryFn: () => promocionesService.calcularDescuentosCarrito(eventoId, tipoUsuario!, items),
    enabled: !!eventoId && !!tipoUsuario && items.length > 0,
    retry: false,
    staleTime: Infinity,
  });
}
