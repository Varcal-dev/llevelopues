"use client";
import { useSyncExternalStore } from "react";

// Las páginas se guardan en caché (de 5 min a 1 h). Para que una promo no se quede visible después de vencer
// (o no aparezca cuando empieza), el navegador revisa la hora real. En el servidor se usa la hora del render.
const MINUTO = 60_000;

const subscribe = (cb: () => void) => {
  const id = setInterval(cb, MINUTO);
  return () => clearInterval(id);
};

// Redondeado al minuto: getSnapshot debe devolver el mismo valor mientras nada cambie.
const snapshot = () => Math.floor(Date.now() / MINUTO) * MINUTO;

export function usePromoClock(renderedAt: number): number {
  return useSyncExternalStore(subscribe, snapshot, () => renderedAt);
}
