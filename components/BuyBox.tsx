"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { addToCart } from "@/lib/cart-actions";
import { buyNow } from "@/lib/actions";
import { notifyCart } from "@/lib/cart-client";

export type BuyVariant = { id: string; title: string; price: number; available: boolean };

export default function BuyBox({
  variants,
  currency,
  freeFrom,
}: {
  variants: BuyVariant[];
  currency: string;
  freeFrom: number; // monto desde el cual el envío es gratis
}) {
  const multi = variants.length > 1; // un producto sin opciones trae una sola variante "Default Title"
  const [sel, setSel] = useState((variants.find((v) => v.available) ?? variants[0]).id);
  const v = variants.find((x) => x.id === sel) ?? variants[0];

  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const money = (n: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

  const add = () =>
    start(async () => {
      const r = await addToCart(v.id, qty);
      if (r.ok) notifyCart();
      setMsg({ ok: r.ok, text: r.ok ? "Agregado a tu carrito." : (r.error ?? "No se pudo agregar.") });
    });

  return (
    <>
      <p className="price">{money(v.price)}</p>
      <p className="pdp-ship">
        {v.price >= freeFrom ? "Envío gratis en este producto" : `Envío gratis desde ${money(freeFrom)}`}
      </p>

      {multi && (
        <fieldset className="variants">
          <legend>Elige una opción</legend>
          {variants.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={o.id === v.id}
              disabled={!o.available}
              onClick={() => { setSel(o.id); setMsg(null); }}
            >
              {o.title}{!o.available && " (agotado)"}
            </button>
          ))}
        </fieldset>
      )}

      <div className="buybox">
        <label>
          Cantidad
          <input type="number" min={1} max={10} value={qty} onChange={(e) => setQty(Math.min(10, Math.max(1, Number(e.target.value) || 1)))} />
        </label>
        <button type="button" onClick={add} disabled={pending || !v.available}>
          {pending ? "Agregando…" : v.available ? "Agregar al carrito" : "Agotado"}
        </button>
        <form action={buyNow}>
          <input type="hidden" name="variantId" value={v.id} />
          <input type="hidden" name="qty" value={qty} />
          <button type="submit" className="ghost" disabled={!v.available}>Comprar ahora</button>
        </form>
        {msg && (
          <p role="status" className={msg.ok ? "buy-msg" : "buy-msg err"}>
            {msg.text} {msg.ok && <Link href="/carrito">Ver carrito</Link>}
          </p>
        )}
      </div>
    </>
  );
}