"use client";
import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

// Tarjeta con días, horas, minutos y segundos hasta el evento.
export default function CountdownCard({ target, name }: { target: number; name: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const s = left === null ? null : Math.floor(left / 1000);
  const cells: [string, string][] = [
    [s === null ? "--" : String(Math.floor(s / 86400)), "Días"],
    [s === null ? "--" : pad(Math.floor(s / 3600) % 24), "Horas"],
    [s === null ? "--" : pad(Math.floor(s / 60) % 60), "Min"],
    [s === null ? "--" : pad(s % 60), "Seg"],
  ];
  return (
    <div className="cd-card" role="timer" aria-label={`Tiempo que falta para ${name}`}>
      <p className="cd-label">Faltan para <strong>{name}</strong></p>
      <div className="cd-cells">
        {cells.map(([v, l]) => (
          <div key={l}><b>{v}</b><small>{l}</small></div>
        ))}
      </div>
    </div>
  );
}
