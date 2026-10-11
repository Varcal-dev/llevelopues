"use server";
import { redirect } from "next/navigation";
import { createCheckout } from "@/lib/shopify";

export async function buyNow(formData: FormData) {
  const variantId = String(formData.get("variantId") ?? "");
  const qty = Math.min(10, Math.max(1, Number(formData.get("qty") ?? 1) || 1));
  if (!variantId) return;
  const url = await createCheckout(variantId, qty);
  redirect(url); // fuera de try/catch: redirect lanza una excepción interna
}