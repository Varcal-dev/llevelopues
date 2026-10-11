"use client";
import { useEffect, useState } from "react";

export default function Countdown({ target }: { target: number }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [target]);
  if (left === null) return null;
  const d = Math.floor(left / 86_400_000);
  const h = Math.floor(left / 3_600_000) % 24;
  return <span>{d > 0 ? `faltan ${d} ${d === 1 ? "día" : "días"} y ${h} h` : `faltan ${h} h`}</span>;
}