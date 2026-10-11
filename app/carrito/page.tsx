import Link from "next/link";
import { cookies } from "next/headers";
import { cartGet, type Cart } from "@/lib/cart";
import { formatPrice, type Product } from "@/lib/shopify";
import { getAllProducts } from "@/lib/catalogo";
import CartLines from "@/components/CartLines";
import CartCountSync from "@/components/CartCountSync";
import FreeShippingBar from "@/components/FreeShippingBar";
import ShippingAddOns from "@/components/ShippingAddOns";
import { pickAddOns, shipping, shippingProgress } from "@/lib/shipping";
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

  // Sugerencias para llegar al envío gratis (si falla Shopify, simplemente no se muestran).
  const progress = cart && cart.lines.length > 0 ? shippingProgress(cart.subtotal) : null;
  let addOns: Product[] = [];
  if (cart && progress && !progress.free) {
    try {
      addOns = pickAddOns(await getAllProducts(), new Set(cart.lines.map((l) => l.handle)), progress.missing);
    } catch {
      addOns = [];
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
          {progress && !progress.free && (
            <ShippingAddOns products={addOns} missing={progress.missing} currency={cart.currency} />
          )}
        </>
      )}
    </main>
  );
}