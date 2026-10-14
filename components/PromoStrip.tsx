"use client";
import Link from "next/link";
import { faseDe, rutaDe, textoAlcance, textoFecha, type Promo } from "@/lib/promos";
import CopyCode from "./CopyCode";
import { usePromoClock } from "./usePromoClock";
import "./promo.css";

// Franja de ofertas encima de los productos (portada y página de cada temporada).
// Tarjeta por promo: vigentes primero, luego las que se avisan; máximo 2 para no saturar.
export default function PromoStrip({ promos, renderedAt, enlace = true }: { promos: Promo[]; renderedAt: number; enlace?: boolean }) {
  const now = usePromoClock(renderedAt);
  const visibles = promos
    .map((p) => ({ p, fase: faseDe(p, now) }))
    .filter((x): x is { p: Promo; fase: "activa" | "aviso" } => x.fase !== null)
    .sort((a, b) => (a.fase === b.fase ? a.p.desde - b.p.desde : a.fase === "activa" ? -1 : 1))
    .slice(0, 2);
  if (visibles.length === 0) return null;
  return (
    <section className="promo-strip" aria-label="Ofertas">
      {visibles.map(({ p, fase }) => (
        <article key={p.codigo} className="promo-card">
          <span className="promo-pct" aria-hidden="true">
            -{p.porcentaje}%
          </span>
          <div className="promo-text">
            {fase === "activa" ? (
              <>
                <h2>
                  {p.porcentaje}% de descuento en {textoAlcance(p)}
                </h2>
                <p>Escribe el código en tu carrito. Vale hasta el {textoFecha(p.hasta)}.</p>
              </>
            ) : (
              <>
                <h2>
                  Desde el {textoFecha(p.desde)}: {p.porcentaje}% en {textoAlcance(p)}
                </h2>
                <p>
                  Guarda el código <strong>{p.codigo}</strong>; vale hasta el {textoFecha(p.hasta)}.
                </p>
              </>
            )}
          </div>
          <div className="promo-actions">
            <code className="promo-code">{p.codigo}</code>
            {fase === "activa" && <CopyCode codigo={p.codigo} />}
            {enlace && (
              <Link className="promo-link" href={rutaDe(p)}>
                Ver productos
              </Link>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
