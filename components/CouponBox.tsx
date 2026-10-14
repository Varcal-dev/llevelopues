"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { applyCoupon, removeCoupon, type CartResult } from "@/lib/cart-actions";
import { notifyCart } from "@/lib/cart-client";
import "./promo.css";

export type CouponSuggestion = { codigo: string; porcentaje: number; alcance: string };

// «¿Tienes un cupón?» del carrito. Muestra el código aplicado (con opción de quitarlo) o el campo para escribirlo.
// Si el carrito ya tiene productos de una promo vigente y no hay código, ofrece aplicarlo con un toque.
export default function CouponBox({ applied, suggestion }: { applied: string[]; suggestion?: CouponSuggestion }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<CartResult>, after?: () => void) =>
    start(async () => {
      const r = await fn();
      setError(r.ok ? null : (r.error ?? "No se pudo actualizar."));
      if (r.ok) {
        after?.();
        notifyCart();
        router.refresh();
      }
    });

  if (applied.length > 0) {
    return (
      <div className="coupon">
        <p className="coupon-on">
          Código aplicado: <strong>{applied.join(", ")}</strong>
          <button type="button" className="link" disabled={pending} onClick={() => run(() => removeCoupon())}>
            Quitar
          </button>
        </p>
        {error && <p role="alert" className="buy-msg err">{error}</p>}
      </div>
    );
  }

  return (
    <div className="coupon">
      {suggestion && (
        <p className="coupon-tip">
          Tienes {suggestion.alcance} en tu carrito: {suggestion.porcentaje}% menos con <strong>{suggestion.codigo}</strong>.{" "}
          <button type="button" className="link" disabled={pending} onClick={() => run(() => applyCoupon(suggestion.codigo))}>
            Aplicar
          </button>
        </p>
      )}
      <form
        className="coupon-form"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => applyCoupon(code), () => setCode(""));
        }}
      >
        <label htmlFor="cupon">¿Tienes un cupón?</label>
        <div className="coupon-row">
          <input
            id="cupon"
            name="cupon"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Escribe tu código"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            maxLength={40}
          />
          <button type="submit" disabled={pending || code.trim() === ""}>
            {pending ? "Aplicando…" : "Aplicar"}
          </button>
        </div>
      </form>
      {error && <p role="alert" className="buy-msg err">{error}</p>}
    </div>
  );
}
