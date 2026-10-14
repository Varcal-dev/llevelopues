import Link from "next/link";
import { formatPrice, type Product } from "@/lib/shopify";
import { promosDeProducto } from "@/lib/promo-catalogo";
import { ahora, precioConCodigo } from "@/lib/promos";
import PromoTag from "./PromoTag";
import "./promo.css";

// Componente de servidor asíncrono: consulta (con caché) qué promos cubren este producto por sus colecciones.
export default async function ProductCard({ p }: { p: Product }) {
  const promos = await promosDeProducto(p.handle);
  const renderedAt = ahora();
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
      {promos.map((promo) => (
        <PromoTag key={promo.codigo} promo={promo} renderedAt={renderedAt} conCodigo={formatPrice(precioConCodigo(p.price, promo.porcentaje), p.currency)} />
      ))}
    </Link>
  );
}
