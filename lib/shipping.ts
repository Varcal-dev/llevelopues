// Política de envío de la tienda (COP). Estos montos deben coincidir con las tarifas por precio
// configuradas en Shopify (Configuración > Envíos y entrega): si cambias uno, cambia el otro.
export const shipping = {
  gratisDesde: 149_900, // subtotal desde el cual el envío es gratis
  tarifa: 14_900, // costo del envío por debajo de ese subtotal
};

export type ShippingProgress = {
  free: boolean;
  missing: number; // lo que falta para envío gratis (0 si ya lo tiene)
  percent: number; // 0 a 100
};

export function shippingProgress(subtotal: number): ShippingProgress {
  const missing = Math.max(0, shipping.gratisDesde - subtotal);
  return {
    free: missing === 0,
    missing,
    percent: Math.min(100, Math.round((subtotal / shipping.gratisDesde) * 100)),
  };
}

/** Texto de la política, para que las páginas legales digan siempre lo mismo que la barra. */
export const shippingPolicyText = (fmt: (n: number) => string) =>
  `El envío cuesta ${fmt(shipping.tarifa)}. Si tu compra es de ${fmt(shipping.gratisDesde)} o más, el envío es gratis.`;

/**
 * Productos para completar el envío gratis: los que no están en el carrito y cuyo precio
 * queda más cerca de lo que falta (uno solo que cubra la diferencia, o el que más se acerque).
 */
export function pickAddOns<T extends { handle: string; price: number }>(
  products: T[],
  inCart: Set<string>,
  missing: number,
  max = 3,
): T[] {
  return products
    .filter((p) => !inCart.has(p.handle) && p.price > 0)
    .sort((a, b) => Math.abs(a.price - missing) - Math.abs(b.price - missing))
    .slice(0, max);
}