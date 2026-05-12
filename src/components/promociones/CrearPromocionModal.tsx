import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useCrearPromocion } from '../../hooks/promociones/useCrearPromocion';
import type { TipoPromocion, TipoUsuario } from '../../types/promociones.types';

const schema = z
  .object({
    nombre: z.string().min(1, 'Requerido'),
    tipo: z.enum(['PREVENTA', 'DESCUENTO', 'CODIGOS'] as const, { required_error: 'Requerido' }),
    fechaInicio: z.string().min(1, 'Requerido'),
    fechaFin: z.string().min(1, 'Requerido'),
    tipoUsuarioRestringido: z.enum(['VIP', 'GENERAL', 'PRENSA', 'PATROCINADOR', ''] as const).optional(),
  })
  .refine(d => d.fechaFin > d.fechaInicio, {
    message: 'La fecha de fin debe ser posterior al inicio',
    path: ['fechaFin'],
  });

type FormValues = z.infer<typeof schema>;

interface CrearPromocionModalProps {
  eventoId: string;
  onClose: () => void;
}

export function CrearPromocionModal({ eventoId, onClose }: CrearPromocionModalProps) {
  const { mutate, isPending } = useCrearPromocion(eventoId);

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
        tipo: data.tipo as TipoPromocion,
        eventoId,
        fechaInicio: data.fechaInicio + ':00',
        fechaFin: data.fechaFin + ':00',
        ...(data.tipoUsuarioRestringido
          ? { tipoUsuarioRestringido: data.tipoUsuarioRestringido as TipoUsuario }
          : {}),
      },
      {
        onSuccess: onClose,
        onError: err => {
          if (axios.isAxiosError(err) && err.response?.status === 409) {
            setError('root', {
              message: err.response.data?.message ?? 'Las fechas son inválidas o se solapan con otra promoción.',
            });
          } else {
            setError('root', { message: 'Error inesperado. Intente de nuevo.' });
          }
        },
      },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Nueva Promoción</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              {...register('nombre')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            />
            {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select
              {...register('tipo')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            >
              <option value="">Seleccionar tipo…</option>
              <option value="PREVENTA">Preventa</option>
              <option value="DESCUENTO">Descuento</option>
              <option value="CODIGOS">Códigos</option>
            </select>
            {errors.tipo && <p className="mt-1 text-xs text-red-600">{errors.tipo.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de inicio</label>
              <input
                type="datetime-local"
                {...register('fechaInicio')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
              />
              {errors.fechaFin && (
                <p className="mt-1 text-xs text-red-600">{errors.fechaFin.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo de usuario restringido{' '}
              <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <select
              {...register('tipoUsuarioRestringido')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            >
              <option value="">Sin restricción</option>
              <option value="VIP">VIP</option>
              <option value="GENERAL">General</option>
              <option value="PRENSA">Prensa</option>
              <option value="PATROCINADOR">Patrocinador</option>
            </select>
          </div>

          {errors.root && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{errors.root.message}</p>
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
              {isPending ? 'Creando…' : 'Crear promoción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
