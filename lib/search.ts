import type { Product } from "@/lib/shopify";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
const version = process.env.SHOPIFY_API_VERSION ?? "2026-07";

const QUERY = `
  query ($q: String!) {
    products(first: 24, query: $q) {
      nodes {
        id title handle tags
        featuredImage { url altText }
        priceRange { minVariantPrice { amount currencyCode } }
      }
    }
  }`;

type Node = { id: string; title: string; handle: string; tags: string[]; featuredImage: { url: string; altText: string | null } | null; priceRange: { minVariantPrice: { amount: string; currencyCode: string } } };

/** Busca productos por texto (título, etiquetas, tipo). Devuelve [] si no hay conexión con Shopify. */
export async function searchProducts(text: string): Promise<Product[]> {
  const q = text.trim().slice(0, 80).replace(/["\\]/g, " ");
  if (!q || !domain || !token) return [];
  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
    body: JSON.stringify({ query: QUERY, variables: { q } }),
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Shopify respondió ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return (json.data.products.nodes as Node[]).map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    image: p.featuredImage?.url ?? null,
    alt: p.featuredImage?.altText ?? p.title,
    price: Number(p.priceRange.minVariantPrice.amount),
    currency: p.priceRange.minVariantPrice.currencyCode,
    tags: p.tags,
  }));
}
