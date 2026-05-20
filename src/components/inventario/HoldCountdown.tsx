import { useState, useEffect } from 'react';

interface HoldCountdownProps {
  expiraEn: string;
}

function calcularSegundosRestantes(expiraEn: string): number {
  const iso =
    expiraEn.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(expiraEn)
      ? expiraEn
      : `${expiraEn}Z`;
  return Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000));
}

export function HoldCountdown({ expiraEn }: HoldCountdownProps) {
  const [totalSeconds, setTotalSeconds] = useState(() => calcularSegundosRestantes(expiraEn));

  useEffect(() => {
    const tick = () => setTotalSeconds(calcularSegundosRestantes(expiraEn));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiraEn]);

  if (totalSeconds <= 0) {
    return <span className="font-mono text-[9px] font-bold text-red-500">Expirado</span>;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return <span className="font-mono text-[9px] font-bold text-orange-500">{timeStr}</span>;
}
