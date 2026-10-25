// Carrito de Shopify (Storefront API). Se guarda solo el id del carrito en una cookie.
const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
const version = process.env.SHOPIFY_API_VERSION ?? "2026-07";

export type CartLine = {
  id: string;
  quantity: number;
  title: string;
  handle: string;
  image: string | null;
  alt: string;
  unitPrice: number;
  subtotal: number; // de la línea, antes del descuento
  discount: number; // lo que descuenta un código en esta línea (0 si no hay)
  total: number; // subtotal − discount
  currency: string;
  productId: string;
};
export type CartCode = { code: string; applicable: boolean }; // applicable=false: Shopify no lo acepta para este carrito
export type Cart = {
  id: string;
  checkoutUrl: string;
  count: number;
  subtotal: number; // suma de las líneas ANTES de descuentos
  discount: number; // total descontado por códigos
  total: number; // subtotal − discount: es sobre lo que Shopify mide el envío gratis
  currency: string;
  codes: CartCode[];
  lines: CartLine[];
  warnings: string[];
};

type Money = { amount: string; currencyCode: string };
type RawCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: Money };
  discountCodes: { code: string; applicable: boolean }[];
  lines: {
    nodes: {
      id: string;
      quantity: number;
      cost: { subtotalAmount: Money; totalAmount: Money };
      discountAllocations: { discountedAmount: Money }[];
      merchandise: { title?: string; price?: Money; image?: { url: string; altText: string | null } | null; product?: { id: string; title: string; handle: string } };
    }[];
  };
};

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  if (!domain || !token) throw new Error("Faltan SHOPIFY_STORE_DOMAIN o SHOPIFY_STOREFRONT_TOKEN");
  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
    body: JSON.stringify({ query, variables }),
    cache: "no-store", // el carrito es de cada visitante: nunca se cachea
  });
  if (!res.ok) throw new Error(`Shopify respondió ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data as T;
}

const FIELDS = `
  id checkoutUrl totalQuantity
  cost { subtotalAmount { amount currencyCode } }
  discountCodes { code applicable }
  lines(first: 50) {
    nodes {
      id quantity
      cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
      discountAllocations { discountedAmount { amount currencyCode } }
      merchandise { ... on ProductVariant { title price { amount currencyCode } image { url altText } product { id title handle } } }
    }
  }`;

const toCart = (c: RawCart, warnings: string[] = []): Cart => {
  const lines: CartLine[] = c.lines.nodes.map((l) => {
    // Los montos se calculan con subtotal − descuentos (no con cost.totalAmount) para que cuadren siempre entre sí.
    const subtotal = Number(l.cost.subtotalAmount.amount);
    const discount = l.discountAllocations.reduce((s, a) => s + Number(a.discountedAmount.amount), 0);
    return {
      productId: (l.merchandise.product?.id ?? "").split("/").pop() ?? "",
      id: l.id,
      quantity: l.quantity,
      title: l.merchandise.product?.title ?? l.merchandise.title ?? "Producto",
      handle: l.merchandise.product?.handle ?? "",
      image: l.merchandise.image?.url ?? null,
      alt: l.merchandise.image?.altText ?? l.merchandise.product?.title ?? "",
      unitPrice: Number(l.merchandise.price?.amount ?? 0),
      subtotal,
      discount,
      total: Math.max(0, subtotal - discount),
      currency: l.cost.totalAmount.currencyCode,
    };
  });
  const subtotal = lines.reduce((s, l) => s + l.subtotal, 0);
  const discount = lines.reduce((s, l) => s + l.discount, 0);
  return {
    warnings,
    id: c.id,
    checkoutUrl: c.checkoutUrl,
    count: c.totalQuantity,
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount),
    currency: c.cost.subtotalAmount.currencyCode,
    codes: c.discountCodes,
    lines,
  };
};

// Ejecuta una mutación y devuelve el carrito; null si el carrito ya no existe (expiró).
async function mutate(field: string, query: string, vars: Record<string, unknown>): Promise<Cart | null> {
  const data = await gql<Record<string, { cart: RawCart | null; userErrors?: { message: string }[]; warnings?: { code: string; message: string }[] }>>(query, vars);
  const r = data[field];
  if (process.env.NODE_ENV === "development" && (r?.warnings?.length || r?.userErrors?.length)) console.warn(`[carrito] ${field}:`, JSON.stringify({ warnings: r.warnings, userErrors: r.userErrors }));
  if (r?.userErrors?.length && !r.cart) return null;
  // Shopify avisa aquí cuando no hay stock suficiente (code MERCHANDISE_OUT_OF_STOCK / NOT_ENOUGH_STOCK)
  return r?.cart ? toCart(r.cart, (r.warnings ?? []).map((w) => w.code)) : null;
}

export async function cartGet(id: string): Promise<Cart | null> {
  const data = await gql<{ cart: RawCart | null }>(`query ($id: ID!) { cart(id: $id) { ${FIELDS} } }`, { id });
  return data.cart ? toCart(data.cart) : null;
}

export async function cartCreate(variantId: string, quantity: number): Promise<Cart> {
  const c = await mutate(
    "cartCreate",
    `mutation ($lines: [CartLineInput!]!) { cartCreate(input: { lines: $lines }) { cart { ${FIELDS} } userErrors { message } warnings { code message } } }`,
    { lines: [{ merchandiseId: variantId, quantity }] },
  );
  if (!c) throw new Error("No se pudo crear el carrito");
  return c;
}

export const cartAdd = (id: string, variantId: string, quantity: number) =>
  mutate(
    "cartLinesAdd",
    `mutation ($id: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $id, lines: $lines) { cart { ${FIELDS} } userErrors { message } warnings { code message } } }`,
    { id, lines: [{ merchandiseId: variantId, quantity }] },
  );

export const cartSetQty = (id: string, lineId: string, quantity: number) =>
  mutate(
    "cartLinesUpdate",
    `mutation ($id: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $id, lines: $lines) { cart { ${FIELDS} } userErrors { message } warnings { code message } } }`,
    { id, lines: [{ id: lineId, quantity }] },
  );

export const cartRemove = (id: string, lineId: string) =>
  mutate(
    "cartLinesRemove",
    `mutation ($id: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $id, lineIds: $lineIds) { cart { ${FIELDS} } userErrors { message } warnings { code message } } }`,
    { id, lineIds: [lineId] },
  );

/** REEMPLAZA los códigos del carrito por la lista dada ([] los quita todos). Los códigos no distinguen mayúsculas. */
export const cartSetCodes = (id: string, codes: string[]) =>
  mutate(
    "cartDiscountCodesUpdate",
    `mutation ($id: ID!, $codes: [String!]!) { cartDiscountCodesUpdate(cartId: $id, discountCodes: $codes) { cart { ${FIELDS} } userErrors { message } warnings { code message } } }`,
    { id, codes },
  );
