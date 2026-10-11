import { cache } from "react";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
const version = process.env.SHOPIFY_API_VERSION ?? "2026-07";

export type Product = {
  id: string;
  title: string;
  handle: string;
  image: string | null;
  alt: string;
  price: number;
  currency: string;
  tags: string[]; // etiquetas de Shopify, ej. "para-mama"
};

async function storefront<T>(
  query: string,
  variables: Record<string, unknown>,
  fresh = false,
): Promise<T | null> {
  if (!domain || !token) return null;
  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    ...(fresh ? { cache: "no-store" as const } : { next: { revalidate: 300 } }),
  });
  if (!res.ok) throw new Error(`Shopify respondió ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data as T;
}

const COLLECTION_QUERY = `
  query ($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        nodes {
          id title handle tags
          featuredImage { url altText }
          priceRange { minVariantPrice { amount currencyCode } }
        }
      }
    }
  }`;

type CollectionData = {
  collection: null | {
    products: {
      nodes: {
        id: string;
        title: string;
        handle: string;
        tags: string[];
        featuredImage: { url: string; altText: string | null } | null;
        priceRange: {
          minVariantPrice: { amount: string; currencyCode: string };
        };
      }[];
    };
  };
};

export async function getCollectionProducts(
  handle: string,
  first = 24,
): Promise<Product[]> {
  const data = await storefront<CollectionData>(COLLECTION_QUERY, {
    handle,
    first,
  });
  return (data?.collection?.products.nodes ?? []).map((p) => ({
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

export type Variant = {
  id: string;
  title: string;
  price: number;
  available: boolean;
};

export type ProductDetail = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  seoTitle: string | null;
  seoDescription: string | null;
  images: { url: string; alt: string }[];
  variants: Variant[];
  available: boolean; // true si al menos una variante se puede comprar
  price: number; // el precio más bajo entre las variantes
  currency: string;
};

const PRODUCT_QUERY = `
  query ($handle: String!) {
    product(handle: $handle) {
      id handle title description descriptionHtml
      seo { title description }
      images(first: 5) { nodes { url altText } }
      variants(first: 50) { nodes { id title availableForSale price { amount currencyCode } } }
    }
  }`;

type ProductData = {
  product: null | {
    id: string;
    handle: string;
    title: string;
    description: string;
    descriptionHtml: string;
    seo: { title: string | null; description: string | null };
    images: { nodes: { url: string; altText: string | null }[] };
    variants: {
      nodes: {
        id: string;
        title: string;
        availableForSale: boolean;
        price: { amount: string; currencyCode: string };
      }[];
    };
  };
};

// cache() evita pedir el mismo producto dos veces (generateMetadata + página) en un mismo render.
export const getProduct = cache(
  async (handle: string): Promise<ProductDetail | null> => {
    const data = await storefront<ProductData>(PRODUCT_QUERY, { handle });
    const p = data?.product;
    if (!p) return null;
    const variants: Variant[] = p.variants.nodes.map((v) => ({
      id: v.id,
      title: v.title,
      price: Number(v.price.amount),
      available: v.availableForSale,
    }));
    return {
      id: p.id,
      handle: p.handle,
      title: p.title,
      description: p.description,
      descriptionHtml: p.descriptionHtml,
      seoTitle: p.seo?.title ?? null,
      seoDescription: p.seo?.description ?? null,
      images: p.images.nodes.map((i) => ({
        url: i.url,
        alt: i.altText ?? p.title,
      })),
      variants,
      available: variants.some((v) => v.available),
      price: variants.length ? Math.min(...variants.map((v) => v.price)) : 0,
      currency: p.variants.nodes[0]?.price.currencyCode ?? "COP",
    };
  },
);

const CART_CREATE = `
  mutation ($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { checkoutUrl }
      userErrors { message }
    }
  }`;

/** Crea un carrito con una línea y devuelve la URL del checkout de Shopify. */
export async function createCheckout(
  variantId: string,
  quantity: number,
): Promise<string> {
  const data = await storefront<{
    cartCreate: {
      cart: { checkoutUrl: string } | null;
      userErrors: { message: string }[];
    };
  }>(CART_CREATE, { lines: [{ merchandiseId: variantId, quantity }] }, true);
  const url = data?.cartCreate.cart?.checkoutUrl;
  if (!url)
    throw new Error(
      data?.cartCreate.userErrors[0]?.message ?? "No se pudo crear el checkout",
    );
  return url;
}

export const formatPrice = (amount: number, currency: string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
