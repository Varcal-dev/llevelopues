"use server";
import { cookies } from "next/headers";
import * as cart from "@/lib/cart";

const ID = "llp_cart"; // httpOnly: el id del carrito
const COUNT = "llp_count"; // legible por el navegador: solo la cantidad, para el globito del header
const base = { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production" };

export type CartResult = { ok: boolean; error?: string };

const clamp = (n: number) => Math.min(10, Math.max(1, Math.floor(Number(n)) || 1));

async function save(c: cart.Cart | null) {
  const jar = await cookies();
  if (c) {
    jar.set(ID, c.id, { ...base, httpOnly: true });
    jar.set(COUNT, String(c.count), base);
  } else {
    jar.delete(ID);
    jar.set(COUNT, "0", base);
  }
}

const FAIL: CartResult = { ok: false, error: "No pudimos actualizar tu carrito. Intenta de nuevo." };

const NO_STOCK: CartResult = { ok: false, error: "Este producto está agotado o no hay unidades suficientes." };

// Shopify deja líneas con cantidad 0 cuando no hay stock; se quitan para no dejar basura en el carrito.
async function dropEmpty(c: cart.Cart): Promise<cart.Cart> {
  let out = c;
  for (const l of c.lines.filter((l) => l.quantity === 0)) out = (await cart.cartRemove(out.id, l.id)) ?? out;
  return out;
}

export async function addToCart(variantId: string, qty: number): Promise<CartResult> {
  try {
    const id = (await cookies()).get(ID)?.value;
    const n = clamp(qty);
    let c = id ? await cart.cartAdd(id, variantId, n) : null;
    if (!c) c = await cart.cartCreate(variantId, n); // sin carrito, o el anterior expiró
    const stockIssue = c.warnings.some((w) => w.includes("STOCK")) || c.lines.some((l) => l.quantity === 0);
    if (stockIssue) c = await dropEmpty(c);
    await save(c);
    return stockIssue ? NO_STOCK : { ok: true };
  } catch {
    return FAIL;
  }
}

export async function updateLine(lineId: string, qty: number): Promise<CartResult> {
  try {
    const id = (await cookies()).get(ID)?.value;
    if (!id) return FAIL;
    await save(await cart.cartSetQty(id, lineId, clamp(qty)));
    return { ok: true };
  } catch {
    return FAIL;
  }
}

export async function removeLine(lineId: string): Promise<CartResult> {
  try {
    const id = (await cookies()).get(ID)?.value;
    if (!id) return FAIL;
    await save(await cart.cartRemove(id, lineId));
    return { ok: true };
  } catch {
    return FAIL;
  }
}