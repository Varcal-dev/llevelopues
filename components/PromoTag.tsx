"use client";
import { faseDe, type Promo } from "@/lib/promos";
import { usePromoClock } from "./usePromoClock";
import "./promo.css";

// Insignia «-10%» sobre la foto y la línea «Con el código X: $precio» bajo el precio. Solo mientras la promo está vigente.
// Va dentro de la tarjeta (.item, que es position: relative); la insignia se posiciona sola sobre la foto.
export default function PromoTag({ promo, renderedAt, conCodigo }: { promo: Promo; renderedAt: number; conCodigo: string }) {
  const now = usePromoClock(renderedAt);
  if (faseDe(promo, now) !== "activa") return null;
  return (
    <>
      <span className="promo-badge">-{promo.porcentaje}%</span>
      <small className="promo-line">
        Con el código {promo.codigo}: <strong>{conCodigo}</strong>
      </small>
    </>
  );
}
