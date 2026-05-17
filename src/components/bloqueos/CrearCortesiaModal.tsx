import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCrearCortesia } from '../../hooks/bloqueos/useCrearCortesia';
import { useAsientosEvento } from '../../hooks/mantenimiento/useAsientosEvento';
import type { CategoriaCortesia } from '../../types/bloqueos.types';

const CATEGORIAS: CategoriaCortesia[] = ['PRENSA', 'ARTISTA', 'PATROCINADOR', 'OTRO'];

const CATEGORIA_LABELS: Record<CategoriaCortesia, string> = {
  PRENSA: 'Prensa',
  ARTISTA: 'Artista',
  PATROCINADOR: 'Patrocinador',
  OTRO: 'Otro',
};

const schema = z.object({
  destinatario: z.string().min(1, 'El destinatario es obligatorio'),
  categoria: z.enum(['PRENSA', 'ARTISTA', 'PATROCINADOR', 'OTRO']),
  asientoId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CrearCortesiaModalProps {
  eventoId: string;
  onClose: () => void;
}

export function CrearCortesiaModal({ eventoId, onClose }: CrearCortesiaModalProps) {
  const { mutate, isPending, error } = useCrearCortesia(eventoId);
  const { data: asientos } = useAsientosEvento(eventoId);

  const disponibles = asientos?.filter(a => a.estado === 'DISPONIBLE') ?? [];

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { categoria: 'OTRO' },
  });

  function onSubmit(data: FormValues) {
    mutate(
      {
        destinatario: data.destinatario,
        categoria: data.categoria,
        asientoId: data.asientoId || undefined,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Nueva cortesía</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Destinatario</label>
            <input
              {...register('destinatario')}
              type="text"
              placeholder="Nombre del invitado"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            />
            {errors.destinatario && (
              <p className="mt-1 text-xs text-red-600">{errors.destinatario.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            <select
              {...register('categoria')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            >
              {CATEGORIAS.map(c => (
                <option key={c} value={c}>{CATEGORIA_LABELS[c]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Asiento <span className="text-gray-400">(opcional — omitir para acceso general)</span>
            </label>
            <select
              {...register('asientoId')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            >
              <option value="">Sin asiento — Acceso general</option>
              {disponibles.map(a => (
                <option key={a.id} value={a.id}>
                  Fila {a.fila} — Asiento {a.numero}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              Error al crear la cortesía. Intenta de nuevo.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-[#413383] px-4 py-2 text-sm font-medium text-white hover:bg-[#362B6E] disabled:opacity-50"
            >
              {isPending ? 'Generando…' : 'Crear cortesía'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
