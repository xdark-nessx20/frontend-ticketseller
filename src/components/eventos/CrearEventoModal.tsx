import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useCrearEvento } from '../../hooks/eventos/useCrearEvento';
import { useRecintos } from '../../hooks/recintos/useRecintos';

const schema = z
  .object({
    nombre: z.string().min(1, 'Requerido'),
    tipo: z.string().min(1, 'Requerido'),
    fechaInicio: z.string().min(1, 'Requerido'),
    fechaFin: z.string().min(1, 'Requerido'),
    recintoId: z.string().min(1, 'Seleccione un recinto'),
  })
  .refine(d => d.fechaFin > d.fechaInicio, {
    message: 'La fecha de fin debe ser posterior al inicio',
    path: ['fechaFin'],
  });

type FormValues = z.infer<typeof schema>;

interface CrearEventoModalProps {
  onClose: () => void;
}

export function CrearEventoModal({ onClose }: CrearEventoModalProps) {
  const { mutate, isPending } = useCrearEvento();
  const { data: recintos } = useRecintos({ estado: 'ACTIVO', size: 100 });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(data: FormValues) {
    mutate(
      {
        nombre: data.nombre,
        tipo: data.tipo,
        fechaInicio: data.fechaInicio + ':00',
        fechaFin: data.fechaFin + ':00',
        recintoId: data.recintoId,
      },
      {
        onSuccess: onClose,
        onError: err => {
          if (axios.isAxiosError(err) && err.response?.status === 409) {
            setError('root', {
              message: err.response.data?.message ?? 'El recinto no está disponible en esas fechas.',
            });
          } else {
            setError('root', { message: 'Error inesperado. Intente de nuevo.' });
          }
        },
      },
    );
  }

  const recintosList = recintos?.content ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Nuevo Evento</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              {...register('nombre')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            {errors.nombre && (
              <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <input
              {...register('tipo')}
              placeholder="Concierto, teatro, conferencia…"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            {errors.tipo && (
              <p className="mt-1 text-xs text-red-600">{errors.tipo.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de inicio</label>
              <input
                type="datetime-local"
                {...register('fechaInicio')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              {errors.fechaInicio && (
                <p className="mt-1 text-xs text-red-600">{errors.fechaInicio.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de fin</label>
              <input
                type="datetime-local"
                {...register('fechaFin')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              {errors.fechaFin && (
                <p className="mt-1 text-xs text-red-600">{errors.fechaFin.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Recinto</label>
            <select
              {...register('recintoId')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Seleccionar recinto…</option>
              {recintosList.map(r => (
                <option key={r.id} value={r.id}>
                  {r.nombre} — {r.ciudad}
                </option>
              ))}
            </select>
            {errors.recintoId && (
              <p className="mt-1 text-xs text-red-600">{errors.recintoId.message}</p>
            )}
          </div>

          {errors.root && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {errors.root.message}
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
              className="rounded-md bg-[#413383] px-4 py-2 text-sm font-medium text-white hover:bg-[#413383]/85 disabled:opacity-50"
            >
              {isPending ? 'Creando…' : 'Crear evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
