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
