import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { recintosService } from '../../services/recintosService';
import type { ConfigurarCategoriaRequest } from '../../types/recinto.types';

export function useConfigurarCategoria(recintoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConfigurarCategoriaRequest) =>
      recintosService.configurarCategoria(recintoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recintos'] });
      queryClient.invalidateQueries({ queryKey: ['recintos', recintoId] });
      sileo.success({ title: 'Categoría configurada', description: 'La categoría del recinto fue actualizada.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al configurar categoría', description: 'No se pudo actualizar la categoría. Intenta de nuevo.' });
    },
  });
}
