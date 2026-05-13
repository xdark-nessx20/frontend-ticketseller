import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ProcesarPagoRequest } from '../../types/checkout.types';

const schema = z
  .object({
    metodoPago: z.enum(['TARJETA', 'NEQUI', 'DAVIPLATA', 'PSE', 'OTRO']),
    numeroTarjeta: z.string(),
    mesExpiracion: z.string(),
    anioExpiracion: z.string(),
    cvv: z.string(),
    titular: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.metodoPago !== 'TARJETA') return;
    if (!/^\d{16}$/.test(data.numeroTarjeta)) {
      ctx.addIssue({ code: 'custom', path: ['numeroTarjeta'], message: 'Debe tener 16 dígitos' });
    }
    if (!/^(0[1-9]|1[0-2])$/.test(data.mesExpiracion)) {
      ctx.addIssue({ code: 'custom', path: ['mesExpiracion'], message: 'Mes inválido (01–12)' });
    }
    if (!/^\d{4}$/.test(data.anioExpiracion)) {
      ctx.addIssue({ code: 'custom', path: ['anioExpiracion'], message: 'Año inválido (AAAA)' });
    }
    if (!/^\d{3,4}$/.test(data.cvv)) {
      ctx.addIssue({ code: 'custom', path: ['cvv'], message: 'CVV inválido' });
    }
    if (!data.titular.trim()) {
      ctx.addIssue({ code: 'custom', path: ['titular'], message: 'Requerido' });
    }
  });

type FormValues = z.infer<typeof schema>;

interface FormularioPagoProps {
  onSubmit: (data: ProcesarPagoRequest) => void;
  isPending: boolean;
  backendError?: string;
}

export function FormularioPago({ onSubmit, isPending, backendError }: FormularioPagoProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      metodoPago: 'TARJETA' as const,
      numeroTarjeta: '',
      mesExpiracion: '',
      anioExpiracion: '',
      cvv: '',
      titular: '',
    },
  });

  const metodoPago = watch('metodoPago');

  function handleValid(data: FormValues) {
    const payload: ProcesarPagoRequest = { metodoPago: data.metodoPago };
    if (data.metodoPago === 'TARJETA') {
      payload.numeroTarjeta = data.numeroTarjeta;
      payload.mesExpiracion = data.mesExpiracion;
      payload.anioExpiracion = data.anioExpiracion;
      payload.cvv = data.cvv;
      payload.titular = data.titular;
    }
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Método de pago</label>
        <select
          {...register('metodoPago')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
        >
          <option value="TARJETA">Tarjeta de crédito / débito</option>
          <option value="NEQUI">Nequi</option>
          <option value="DAVIPLATA">Daviplata</option>
          <option value="PSE">PSE</option>
          <option value="OTRO">Otro</option>
        </select>
      </div>

      {metodoPago === 'TARJETA' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Titular</label>
            <input
              {...register('titular')}
              placeholder="Nombre como aparece en la tarjeta"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            />
            {errors.titular && (
              <p className="mt-1 text-xs text-red-600">{errors.titular.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Número de tarjeta</label>
            <input
              {...register('numeroTarjeta')}
              placeholder="1234 5678 9012 3456"
              maxLength={16}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            />
            {errors.numeroTarjeta && (
              <p className="mt-1 text-xs text-red-600">{errors.numeroTarjeta.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mes exp.</label>
              <input
                {...register('mesExpiracion')}
                placeholder="MM"
                maxLength={2}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
              />
              {errors.mesExpiracion && (
                <p className="mt-1 text-xs text-red-600">{errors.mesExpiracion.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Año exp.</label>
              <input
                {...register('anioExpiracion')}
                placeholder="AAAA"
                maxLength={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
              />
              {errors.anioExpiracion && (
                <p className="mt-1 text-xs text-red-600">{errors.anioExpiracion.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CVV</label>
              <input
                {...register('cvv')}
                placeholder="123"
                maxLength={4}
                type="password"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
              />
              {errors.cvv && (
                <p className="mt-1 text-xs text-red-600">{errors.cvv.message}</p>
              )}
            </div>
          </div>
        </>
      )}

      {metodoPago !== 'TARJETA' && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            Serás redirigido a la pasarela de{' '}
            <strong>
              {{ NEQUI: 'Nequi', DAVIPLATA: 'Daviplata', PSE: 'PSE', OTRO: 'pago' }[metodoPago]}
            </strong>{' '}
            para completar la transacción. Tu reserva se mantendrá activa mientras el pago es
            confirmado.
          </p>
        </div>
      )}

      {backendError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-sm text-red-600">{backendError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-[#413383] px-4 py-3 text-sm font-medium text-white hover:bg-[#362B6E] disabled:opacity-50"
      >
        {isPending ? 'Procesando pago…' : 'Pagar ahora'}
      </button>
    </form>
  );
}
