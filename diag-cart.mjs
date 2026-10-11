// Diagnóstico del carrito. Uso (en la raíz del proyecto):  node diag-cart.mjs [handle-del-producto]
// Lee .env.local, prueba agregar CADA variante del producto a un carrito de prueba y muestra lo que responde Shopify.
import { readFileSync } from "node:fs";

for (const f of [".env.local", ".env"]) {
  try {
    for (const l of readFileSync(f, "utf8").split(/\r?\n/)) {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"#]*)"?\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {}
}
const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
const version = process.env.SHOPIFY_API_VERSION ?? "2026-07";
if (!domain || !token) { console.error("Faltan SHOPIFY_STORE_DOMAIN o SHOPIFY_STOREFRONT_TOKEN en .env.local"); process.exit(1); }

const gql = async (query, variables = {}) => {
  const r = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
};

let handle = process.argv[2];
if (!handle) {
  const j = await gql(`{ products(first: 5, query: "tag:* OR title:*Halloween*") { nodes { handle title } } }`);
  const list = j.data?.products?.nodes ?? [];
  console.log("Productos visibles para la Storefront API:", list.map((p) => p.handle));
  handle = list[0]?.handle;
  if (!handle) { console.error("La Storefront API no devuelve productos. Respuesta:", JSON.stringify(j)); process.exit(1); }
}

const withQty = `query ($h: String!) { product(handle: $h) { title variants(first: 50) { nodes { id title availableForSale currentlyNotInStock quantityAvailable } } } }`;
const noQty = `query ($h: String!) { product(handle: $h) { title variants(first: 50) { nodes { id title availableForSale currentlyNotInStock } } } }`;
let j = await gql(withQty, { h: handle });
if (j.errors) { console.log("(El token no puede leer quantityAvailable; sigo sin ese dato)"); j = await gql(noQty, { h: handle }); }
const p = j.data?.product;
if (!p) { console.error("No existe ese handle:", handle, JSON.stringify(j)); process.exit(1); }
console.log(`\nProducto: ${p.title}`);
// Se prueba cada variante dos veces: sin contexto y con contexto de país (Colombia), para descubrir si el problema son los Mercados.
const ctxs = [["sin contexto", ""], ["país=CO", " @inContext(country: CO)"]];
for (const v of p.variants.nodes) for (const [label, ctx] of ctxs) {
  const c = await gql(
    `mutation ($l: [CartLineInput!]!)${ctx} { cartCreate(input: { lines: $l }) { cart { lines(first: 5) { nodes { quantity cost { totalAmount { amount } } } } } userErrors { code message } warnings { code message } } }`,
    { l: [{ merchandiseId: v.id, quantity: 1 }] },
  );
  const r = c.data?.cartCreate;
  console.log(`\n- Variante «${v.title}» [${label}]  disponible=${v.availableForSale}  sinStock=${v.currentlyNotInStock}  cantidad=${v.quantityAvailable ?? "(sin dato)"}`);
  console.log("  cantidad en el carrito:", r?.cart?.lines.nodes.map((n) => n.quantity), " total:", r?.cart?.lines.nodes.map((n) => n.cost.totalAmount.amount));
  console.log("  warnings:", JSON.stringify(r?.warnings), " userErrors:", JSON.stringify(r?.userErrors), c.errors ? " errors: " + JSON.stringify(c.errors) : "");
}
