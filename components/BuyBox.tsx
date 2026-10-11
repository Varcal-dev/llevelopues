"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { addToCart } from "@/lib/cart-actions";
import { buyNow } from "@/lib/actions";
import { notifyCart } from "@/lib/cart-client";

export default function BuyBox({ variantId }: { variantId: string }) {
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const add = () =>
    start(async () => {
      const r = await addToCart(variantId, qty);
      if (r.ok) notifyCart();
      setMsg({ ok: r.ok, text: r.ok ? "Agregado a tu carrito." : (r.error ?? "No se pudo agregar.") });
    });

  return (
    <div className="buybox">
      <label>
        Cantidad
        <input type="number" min={1} max={10} value={qty} onChange={(e) => setQty(Math.min(10, Math.max(1, Number(e.target.value) || 1)))} />
      </label>
      <button type="button" onClick={add} disabled={pending}>
        {pending ? "Agregando…" : "Agregar al carrito"}
      </button>
      <form action={buyNow}>
        <input type="hidden" name="variantId" value={variantId} />
        <input type="hidden" name="qty" value={qty} />
        <button type="submit" className="ghost">Comprar ahora</button>
      </form>
      {msg && (
        <p role="status" className={msg.ok ? "buy-msg" : "buy-msg err"}>
          {msg.text} {msg.ok && <Link href="/carrito">Ver carrito</Link>}
        </p>
      )}
    </div>
  );
}
