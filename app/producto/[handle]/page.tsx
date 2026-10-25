import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduct } from "@/lib/shopify";
import { promosDeProducto } from "@/lib/promo-catalogo";
import { ahora } from "@/lib/promos";
import BuyBox from "@/components/BuyBox";
import { shipping } from "@/lib/shipping";
import "@/components/cart.css";
import MetaPixelEvent from "@/components/MetaPixelEvent";

export const revalidate = 300;

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const p = await getProduct(handle);
  if (!p) return { title: "Producto no encontrado", robots: { index: false } };

  const title = p.seoTitle || `${p.title} | Llévelo pues`;
  const description = (p.seoDescription || p.description).replace(/\s+/g, " ").trim().slice(0, 160);
  const image = p.images[0];
  const url = `/producto/${p.handle}`; // el handle vigente; los antiguos redirigen en Shopify

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "es_CO",
      siteName: "Llévelo pues",
      title,
      description,
      url,
      images: image ? [{ url: image.url, alt: image.alt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image.url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const p = await getProduct(handle);
  if (!p) notFound();
  const productId = p.id.split("/").pop()!;
  const promos = await promosDeProducto(p.handle); // promos de las colecciones a las que pertenece este producto

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.description,
    image: p.images.map((i) => i.url),
    offers: p.variants.map((v) => ({
      "@type": "Offer",
      name: v.title,
      priceCurrency: p.currency,
      price: v.price,
      availability: v.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    })),
  };

  return (
    <main className="wrap pdp">
      {p.variants.length > 0 && (
  <MetaPixelEvent
    event="ViewContent"
    params={{
      content_name: p.title,
      content_ids: [productId],
      content_type: "product",
      value: p.variants[0].price,
      currency: p.currency,
    }}
  />
)}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="pdp-media">
        {p.images.map((img) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={img.url} src={img.url} alt={img.alt} />
        ))}
      </div>
      <div className="pdp-info">
        <Link href="/" className="back">Volver</Link>
        <h1>{p.title}</h1>
        {p.available ? (
          <BuyBox variants={p.variants} currency={p.currency} freeFrom={shipping.gratisDesde} promos={promos} renderedAt={ahora()} productId={productId}
productTitle={p.title}/>
        ) : (
          <p className="note">Producto agotado por ahora.</p>
        )}
        {/* HTML de Shopify (viene de tu propio admin). Va en <div>, no en <p>. */}
        <div className="desc" dangerouslySetInnerHTML={{ __html: p.descriptionHtml }} />
      </div>
    </main>
  );
}
