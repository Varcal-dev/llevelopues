const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_TOKEN;

if (!domain || !token) {
  console.error("Faltan SHOPIFY_STORE_DOMAIN o SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  process.exit(1);
}

const res = await fetch(`https://${domain}/api/2026-01/graphql.json`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": token,
  },
  body: JSON.stringify({
    query: `{ shop { name } products(first: 5) { edges { node { title handle } } } }`,
  }),
});

console.log("Status:", res.status);
console.log(JSON.stringify(await res.json(), null, 2));