import Link from "next/link";
import { cookies } from "next/headers";
import { cartGet, type Cart } from "@/lib/cart";
import { formatPrice } from "@/lib/shopify";
import CartLines from "@/components/CartLines";
import CartCountSync from "@/components/CartCountSync";
import FreeShippingBar from "@/components/FreeShippingBar";
import { shipping, shippingProgress } from "@/lib/shipping";
import "@/components/cart.css";

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
            }))}
          />
          <div className="cart-summary">
            <FreeShippingBar subtotal={cart.subtotal} currency={cart.currency} />
            <p>
              Subtotal <strong>{formatPrice(cart.subtotal, cart.currency)}</strong>
            </p>
            <p className="cart-hint">
              {shippingProgress(cart.subtotal).free
                ? "Envío gratis incluido."
                : `Envío: ${formatPrice(shipping.tarifa, cart.currency)}, se confirma al pagar.`}
            </p>
            <a className="ask" href={cart.checkoutUrl}>Ir a pagar</a>
          </div>
        </>
      )}
    </main>
  );
}