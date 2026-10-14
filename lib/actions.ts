"use server";
import { redirect } from "next/navigation";
import { createCheckout } from "@/lib/shopify";
import { PROMOS, ahora, faseDe } from "@/lib/promos";

export async function buyNow(formData: FormData) {
  const variantId = String(formData.get("variantId") ?? "");
  const qty = Math.min(10, Math.max(1, Number(formData.get("qty") ?? 1) || 1));
  if (!variantId) return;

  // «Comprar ahora» lleva el código de la promo vigente. El navegador manda el que vio, pero aquí se revisa:
  // solo pasa si es una promo conocida y vigente en este instante. Shopify decide si aplica al producto.
  const pedido = String(formData.get("code") ?? "").trim().toUpperCase();
  const promo = pedido ? PROMOS.find((p) => p.codigo.toUpperCase() === pedido && faseDe(p, ahora()) === "activa") : undefined;

  const url = await createCheckout(variantId, qty, promo?.codigo);
  redirect(url); // fuera de try/catch: redirect lanza una excepción interna
}
