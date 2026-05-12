import { useState, useEffect, useRef } from 'react';
import { useCarritoStore } from '../../stores/carritoStore';

interface CountdownResult {
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
}

function calcularSegundosRestantes(fechaExpiracion: string | null): number {
  if (!fechaExpiracion) return 0;
  return Math.max(0, Math.floor((new Date(fechaExpiracion).getTime() - Date.now()) / 1000));
}

export function useCarritoCountdown(fechaExpiracion: string | null): CountdownResult {
  const marcarExpirado = useCarritoStore(s => s.marcarExpirado);
  const [totalSeconds, setTotalSeconds] = useState(() => calcularSegundosRestantes(fechaExpiracion));
  const expiredNotified = useRef(false);

  useEffect(() => {
    expiredNotified.current = false;

    const tick = () => {
      const remaining = calcularSegundosRestantes(fechaExpiracion);
      setTotalSeconds(remaining);
      if (remaining <= 0 && !expiredNotified.current) {
        expiredNotified.current = true;
        marcarExpirado();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [fechaExpiracion, marcarExpirado]);

  const isExpired = totalSeconds <= 0;

  return {
    minutes: isExpired ? 0 : Math.floor(totalSeconds / 60),
    seconds: isExpired ? 0 : totalSeconds % 60,
    totalSeconds,
    isExpired,
  };
}
