"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { addToCart } from "@/lib/cart-actions";
import { buyNow } from "@/lib/actions";
import { notifyCart } from "@/lib/cart-client";
import {
  faseDe,
  precioConCodigo,
  textoAlcance,
  textoFecha,
  type Promo,
} from "@/lib/promos";
import CopyCode from "./CopyCode";
import { usePromoClock } from "./usePromoClock";
import "./promo.css";

export type BuyVariant = {
  id: string;
  title: string;
  price: number;
  available: boolean;
};

export default function BuyBox({
  variants,
  currency,
  freeFrom,
  promos = [],
  renderedAt,
  productId,
  productTitle,
}: {
  variants: BuyVariant[];
  currency: string;
  freeFrom: number; // monto desde el cual el envío es gratis
  promos?: Promo[]; // promos cuya colección incluye este producto
  renderedAt: number; // hora del servidor al renderizar (el navegador la corrige con su reloj)
  productId: string; // ID numérico del producto (el mismo en todos los eventos de Meta)
  productTitle: string;
}) {
  const multi = variants.length > 1;
  const [sel, setSel] = useState(
    (variants.find((v) => v.available) ?? variants[0]).id,
  );
  const v = variants.find((x) => x.id === sel) ?? variants[0];

  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const now = usePromoClock(renderedAt);
  const activa = promos.find((p) => faseDe(p, now) === "activa");
  const aviso = activa
    ? undefined
    : promos.find((p) => faseDe(p, now) === "aviso");
  const conCodigo = activa
    ? precioConCodigo(v.price, activa.porcentaje)
    : v.price;

  const money = (n: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);

  const add = () =>
    start(async () => {
      const r = await addToCart(v.id, qty);

      if (r.ok) {
        notifyCart();
        window.fbq?.("track", "AddToCart", {
          content_name: productTitle,
          content_ids: [productId],
          content_type: "product",
          value: v.price * qty,
          currency,
          num_items: qty,
        });
      }

      setMsg({
        ok: r.ok,
        text: r.ok
          ? "Agregado a tu carrito."
          : (r.error ?? "No se pudo agregar."),
      });
    });
  return (
    <>
      <p className="price">{money(v.price)}</p>
      <p className="pdp-ship">
        {conCodigo >= freeFrom
          ? "Envío gratis en este producto"
          : `Envío gratis desde ${money(freeFrom)}`}
      </p>

      {activa && (
        <div className="promo-box">
          <p className="promo-title">
            {activa.porcentaje}% menos con el código
          </p>
          <div className="promo-code-row">
            <code className="promo-code">{activa.codigo}</code>
            <CopyCode codigo={activa.codigo} />
          </div>
          <p className="promo-now">
            Pagas <strong>{money(conCodigo)}</strong> por unidad
          </p>
          <p className="promo-fine">
            Con «Comprar ahora» se aplica solo. Si lo agregas al carrito,
            escríbelo allí. Válido en {textoAlcance(activa)} hasta el{" "}
            {textoFecha(activa.hasta)}.
          </p>
        </div>
      )}
      {aviso && (
        <div className="promo-box">
          <p className="promo-title">
            Desde el {textoFecha(aviso.desde)}: {aviso.porcentaje}% menos con el
            código
          </p>
          <div className="promo-code-row">
            <code className="promo-code">{aviso.codigo}</code>
          </div>
          <p className="promo-fine">
            Válido en {textoAlcance(aviso)} del {textoFecha(aviso.desde)} al{" "}
            {textoFecha(aviso.hasta)}.
          </p>
        </div>
      )}

      {multi && (
        <fieldset className="variants">
          <legend>Elige una opción</legend>
          {variants.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={o.id === v.id}
              disabled={!o.available}
              onClick={() => {
                setSel(o.id);
                setMsg(null);
              }}
            >
              {o.title}
              {!o.available && " (agotado)"}
            </button>
          ))}
        </fieldset>
      )}

      <div className="buybox">
        <label>
          Cantidad
          <input
            type="number"
            min={1}
            max={10}
            value={qty}
            onChange={(e) =>
              setQty(Math.min(10, Math.max(1, Number(e.target.value) || 1)))
            }
          />
        </label>
        <button type="button" onClick={add} disabled={pending || !v.available}>
          {pending
            ? "Agregando…"
            : v.available
              ? "Agregar al carrito"
              : "Agotado"}
        </button>
        <form
          action={buyNow}
          onSubmit={() =>
            window.fbq?.("track", "InitiateCheckout", {
              value: conCodigo * qty,
              currency,
              content_ids: [productId],
              content_type: "product",
              num_items: qty,
            })
          }
        >
          <input type="hidden" name="variantId" value={v.id} />
          <input type="hidden" name="qty" value={qty} />
          <input type="hidden" name="code" value={activa?.codigo ?? ""} />
          <button type="submit" className="ghost" disabled={!v.available}>
            Comprar ahora
          </button>
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