import type { Product } from "@/lib/shopify";
import { formatPrice } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";

// Sugerencias bajo la barra de envío gratis. Componente de servidor: solo enlaces, sin JS en el navegador.
export default function ShippingAddOns({ products, missing, currency }: { products: Product[]; missing: number; currency: string }) {
  if (products.length === 0) return null;
  return (
    <section className="ship-add" aria-labelledby="ship-add-title">
      <h2 id="ship-add-title">Te faltan {formatPrice(missing, currency)}: completa tu envío gratis</h2>
      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}