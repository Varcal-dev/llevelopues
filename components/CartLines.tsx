"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { removeLine, updateLine, type CartResult } from "@/lib/cart-actions";
import { notifyCart } from "@/lib/cart-client";

export type CartLineView = {
  id: string;
  quantity: number;
  title: string;
  handle: string;
  image: string | null;
  alt: string;
  unit: string; // precio unitario ya formateado
  total: string; // total de la línea ya formateado
};

export default function CartLines({ lines }: { lines: CartLineView[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<CartResult>) =>
    start(async () => {
      const r = await fn();
      setError(r.ok ? null : (r.error ?? "No se pudo actualizar."));
      if (r.ok) {
        notifyCart();
        router.refresh();
      }
    });

  return (
    <>
      <ul className="cart-lines">
        {lines.map((l) => (
          <li key={l.id}>
            {l.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={l.image} alt={l.alt} loading="lazy" />
            ) : (
              <div className="noimg" />
            )}
            <div className="cart-info">
              <Link href={`/producto/${l.handle}`}>{l.title}</Link>
              <p>{l.unit}</p>
              <div className="cart-qty">
                <button type="button" aria-label="Quitar uno" disabled={pending || l.quantity <= 1} onClick={() => run(() => updateLine(l.id, l.quantity - 1))}>−</button>
                <span aria-live="polite">{l.quantity}</span>
                <button type="button" aria-label="Agregar uno" disabled={pending || l.quantity >= 10} onClick={() => run(() => updateLine(l.id, l.quantity + 1))}>+</button>
                <button type="button" className="link" disabled={pending} onClick={() => run(() => removeLine(l.id))}>Quitar</button>
              </div>
            </div>
            <strong>{l.total}</strong>
          </li>
        ))}
      </ul>
      {error && <p role="alert" className="buy-msg err">{error}</p>}
    </>
  );
}
