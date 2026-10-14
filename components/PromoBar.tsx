"use client";
import Link from "next/link";
import { faseDe, rutaDe, textoAlcance, textoFecha, type Promo } from "@/lib/promos";
import { usePromoClock } from "./usePromoClock";
import "./promo.css";

// Barra delgada arriba de todo el sitio. Con promo vigente la anuncia; en los días previos avisa cuándo empieza.
// Si hay varias, gana la vigente. No muestra nada si no hay promo que anunciar.
export default function PromoBar({ promos, renderedAt }: { promos: Promo[]; renderedAt: number }) {
  const now = usePromoClock(renderedAt);
  const activa = promos.find((p) => faseDe(p, now) === "activa");
  const promo = activa ?? promos.find((p) => faseDe(p, now) === "aviso");
  if (!promo) return null;
  return (
    <div className="promo-bar" role="region" aria-label="Promoción">
      <p>
        {activa ? (
          <>
            <strong>{promo.porcentaje}% menos</strong> en {textoAlcance(promo)} con el código <code>{promo.codigo}</code>
            {" · "}hasta el {textoFecha(promo.hasta)}
          </>
        ) : (
          <>
            Desde el <strong>{textoFecha(promo.desde)}</strong>: {promo.porcentaje}% en {textoAlcance(promo)} con el código{" "}
            <code>{promo.codigo}</code>
          </>
        )}{" "}
        <Link href={rutaDe(promo)}>Ver productos</Link>
      </p>
    </div>
  );
}
