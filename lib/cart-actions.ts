"use server";
import { cookies } from "next/headers";
import * as cart from "@/lib/cart";
import { explicarCodigo } from "@/lib/promos";

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

/**
 * Aplica un código de cupón al carrito. Shopify no da error con un código malo: lo deja con applicable=false.
 * En ese caso se restauran los códigos que ya había (los que sí servían) y se explica por qué no sirvió.
 */
export async function applyCoupon(raw: string): Promise<CartResult> {
  const code = String(raw ?? "").replace(/\s+/g, "").toUpperCase().slice(0, 40);
  if (!code) return { ok: false, error: "Escribe tu código." };
  try {
    const id = (await cookies()).get(ID)?.value;
    if (!id) return FAIL;
    const before = await cart.cartGet(id);
    if (!before) return FAIL;
    const previous = before.codes.filter((c) => c.applicable).map((c) => c.code);

    const after = await cart.cartSetCodes(id, [code]);
    if (!after) return FAIL;
    const applied = after.codes.find((c) => c.code.toUpperCase() === code);
    if (!applied?.applicable) {
      await cart.cartSetCodes(id, previous);
      return { ok: false, error: explicarCodigo(code) ?? "Ese código no existe, ya venció o no aplica a los productos de tu carrito." };
    }
    await save(after);
    return { ok: true };
  } catch {
    return FAIL;
  }
}

export async function removeCoupon(): Promise<CartResult> {
  try {
    const id = (await cookies()).get(ID)?.value;
    if (!id) return FAIL;
    await save(await cart.cartSetCodes(id, []));
    return { ok: true };
  } catch {
    return FAIL;
  }
}
