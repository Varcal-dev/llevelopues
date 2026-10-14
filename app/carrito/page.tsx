import Link from "next/link";
import { cookies } from "next/headers";
import { cartGet, type Cart } from "@/lib/cart";
import { formatPrice, type Product } from "@/lib/shopify";
import { getAllProducts } from "@/lib/catalogo";
import { getPromoMap } from "@/lib/promo-catalogo";
import { ahora, faseDe, textoAlcance } from "@/lib/promos";
import CartLines from "@/components/CartLines";
import CartCountSync from "@/components/CartCountSync";
import CouponBox, { type CouponSuggestion } from "@/components/CouponBox";
import FreeShippingBar from "@/components/FreeShippingBar";
import ShippingAddOns from "@/components/ShippingAddOns";
import { pickAddOns, shipping, shippingProgress } from "@/lib/shipping";
import "@/components/cart.css";
import "@/components/promo.css";

export const metadata = { title: "Tu carrito — Llévelo pues" };

export default async function CartPage() {
  const id = (await cookies()).get("llp_cart")?.value;
  let cart: Cart | null = null;
  let failed = false;
  try {
    cart = id ? await cartGet(id) : null;
  } catch {
    failed = true;
  }

  // Líneas viejas con cantidad 0 (sin stock): no se muestran ni cuentan.
  const sinStock = cart ? cart.lines.filter((l) => l.quantity === 0) : [];
  if (cart && sinStock.length > 0) {
    cart = { ...cart, lines: cart.lines.filter((l) => l.quantity > 0) };
  }

  // Shopify mide el envío gratis sobre el total CON descuento, así que la barra usa cart.total.
  const progress = cart && cart.lines.length > 0 ? shippingProgress(cart.total) : null;
  let addOns: Product[] = [];
  if (cart && progress && !progress.free) {
    try {
      addOns = pickAddOns(await getAllProducts(), new Set(cart.lines.map((l) => l.handle)), progress.missing);
    } catch {
      addOns = [];
    }
  }

  // Cupón: lo que ya está aplicado y, si no hay ninguno, una promo vigente que cubra algún producto del carrito.
  const applied = cart ? cart.codes.filter((c) => c.applicable).map((c) => c.code) : [];
  let suggestion: CouponSuggestion | undefined;
  if (cart && cart.lines.length > 0 && applied.length === 0) {
    const map = await getPromoMap(); // si Shopify falla devuelve un mapa vacío: simplemente no hay sugerencia
    const now = ahora();
    for (const l of cart.lines) {
      const p = (map.get(l.handle) ?? []).find((x) => faseDe(x, now) === "activa");
      if (p) {
        suggestion = { codigo: p.codigo, porcentaje: p.porcentaje, alcance: textoAlcance(p) };
        break;
      }
    }
  }

  return (
    <main className="wrap cart">
      <h1 className="section-title">Tu carrito</h1>
      {failed ? (
        <p className="note">No pudimos cargar tu carrito. Intenta de nuevo en un momento.</p>
      ) : !cart || cart.lines.length === 0 ? (
        <>
          <CartCountSync count={0} />
          <p className="note">Tu carrito está vacío. ¡Aquí hay algo que te va a gustar!</p>
          <Link className="ask" href="/">Ver productos</Link>
        </>
      ) : (
        <>
          <CartCountSync count={cart.count} />
          {sinStock.length > 0 && (
            <p className="buy-msg err" role="alert">
              Sin stock por ahora: {sinStock.map((l) => l.title).join(", ")}. No los incluimos en tu pedido.
            </p>
          )}
          <CartLines
            lines={cart.lines.map((l) => ({
              id: l.id,
              quantity: l.quantity,
              title: l.title,
              handle: l.handle,
              image: l.image,
              alt: l.alt,
              unit: formatPrice(l.unitPrice, l.currency),
              total: formatPrice(l.total, l.currency),
              original: l.discount > 0 ? formatPrice(l.subtotal, l.currency) : undefined,
            }))}
          />
          <div className="cart-summary">
            <CouponBox applied={applied} suggestion={suggestion} />
            <FreeShippingBar subtotal={cart.total} currency={cart.currency} />
            {cart.discount > 0 ? (
              <>
                <p>
                  Subtotal <strong>{formatPrice(cart.subtotal, cart.currency)}</strong>
                </p>
                <p className="cart-discount">
                  Descuento <strong>−{formatPrice(cart.discount, cart.currency)}</strong>
                </p>
                <p>
                  Total sin envío <strong>{formatPrice(cart.total, cart.currency)}</strong>
                </p>
              </>
            ) : (
              <p>
                Subtotal <strong>{formatPrice(cart.subtotal, cart.currency)}</strong>
              </p>
            )}
            {cart.discount > 0 && progress && !progress.free && shippingProgress(cart.subtotal).free && (
              <p className="cart-warn">
                Con el descuento, tu compra queda por debajo de {formatPrice(shipping.gratisDesde, cart.currency)} y el envío se cobra. Agrega{" "}
                {formatPrice(progress.missing, cart.currency)} más y es gratis.
              </p>
            )}
            <p className="cart-hint">
              {shippingProgress(cart.total).free
                ? "Envío gratis incluido."
                : `Envío: ${formatPrice(shipping.tarifa, cart.currency)}, se confirma al pagar.`}
            </p>
            <a className="ask" href={cart.checkoutUrl}>Ir a pagar</a>
          </div>
          {progress && !progress.free && (
            <ShippingAddOns products={addOns} missing={progress.missing} currency={cart.currency} />
          )}
        </>
      )}
    </main>
  );
}
