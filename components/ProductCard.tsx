import Link from "next/link";
import { formatPrice, type Product } from "@/lib/shopify";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/producto/${p.handle}`} className="item">
      {p.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.image} alt={p.alt} loading="lazy" />
      ) : (
        <div className="noimg" />
      )}
      <h3>{p.title}</h3>
      <p>{formatPrice(p.price, p.currency)}</p>
    </Link>
  );
}