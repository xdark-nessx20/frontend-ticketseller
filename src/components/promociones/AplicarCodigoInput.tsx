import { useState } from 'react';
import axios from 'axios';
import { useAplicarCodigo } from '../../hooks/promociones/useAplicarCodigo';
import { DescuentoAplicadoResumen } from './DescuentoAplicadoResumen';

export function AplicarCodigoInput() {
  const [codigo, setCodigo] = useState('');
  const { mutate, isPending, data: descuentoAplicado, reset } = useAplicarCodigo();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleAplicar() {
    if (!codigo.trim()) return;
    setErrorMsg(null);
    reset();
    mutate(
      { codigo: codigo.trim() },
      {
        onError: err => {
          if (axios.isAxiosError(err) && err.response?.status === 409) {
            setErrorMsg(
              err.response.data?.message ?? 'El código es inválido, ya fue agotado o expiró.',
            );
          } else {
            setErrorMsg('No se pudo aplicar el código. Intenta de nuevo.');
          }
        },
        onSuccess: () => {
          setCodigo('');
          setErrorMsg(null);
        },
      },
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={codigo}
          onChange={e => setCodigo(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAplicar()}
          placeholder="Ingresa tu código promocional"
          disabled={isPending}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none disabled:bg-gray-50"
        />
        <button
          onClick={handleAplicar}
          disabled={isPending || !codigo.trim()}
          className="rounded-md bg-[#413383] px-4 py-2 text-sm font-medium text-white hover:bg-[#362B6E] disabled:opacity-50"
        >
          {isPending ? 'Aplicando…' : 'Aplicar'}
        </button>
      </div>

      {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}

      {descuentoAplicado && <DescuentoAplicadoResumen descuento={descuentoAplicado} />}
    </div>
  );
}
