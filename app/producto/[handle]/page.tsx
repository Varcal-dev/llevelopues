import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduct, formatPrice } from "@/lib/shopify";
import BuyBox from "@/components/BuyBox";
import "@/components/cart.css";

export const revalidate = 300;

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const p = await getProduct(handle);
  if (!p) notFound();

  return (
    <main className="wrap pdp">
      <div className="pdp-media">
        {p.images.map((img) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={img.url} src={img.url} alt={img.alt} />
        ))}
      </div>
      <div className="pdp-info">
        <Link href="/" className="back">Volver</Link>
        <h1>{p.title}</h1>
        <p className="price">{formatPrice(p.price, p.currency)}</p>
        {p.variantId ? (
          <BuyBox variantId={p.variantId} />
        ) : (
          <p className="note">Producto agotado por ahora.</p>
        )}
        <p className="desc">{p.description}</p>
      </div>
    </main>
  );
}