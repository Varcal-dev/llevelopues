import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { PRESUPUESTOS } from "@/lib/categorias";
import { getAllProducts } from "@/lib/catalogo";
import "@/components/home-sections.css";
import { formatPrice, type Product } from "@/lib/shopify";

export const metadata = { title: "Regalos por presupuesto — Llévelo pues" };

export default async function Regalos({ searchParams }: { searchParams: Promise<{ hasta?: string }> }) {
  const { hasta } = await searchParams;
  const max = PRESUPUESTOS.includes(Number(hasta)) ? Number(hasta) : null; // solo rangos conocidos
  let products: Product[] = [];
  let failed = false;
  try {
    products = (await getAllProducts()).filter((p) => (max ? p.price <= max : true)).sort((a, b) => a.price - b.price);
  } catch {
    failed = true;
  }
  return (
    <main className="wrap">
      <Link href="/" className="back">Volver</Link>
      <h1 className="section-title" style={{ paddingTop: 16 }}>
        {max ? `Regalos hasta ${formatPrice(max, "COP")}` : "Regalos por presupuesto"}
      </h1>
      <div className="who-row" style={{ paddingBottom: 24 }}>
        {PRESUPUESTOS.map((m) => (
          <Link key={m} href={`/regalos?hasta=${m}`} aria-current={m === max ? "page" : undefined} className="chip-link">
            {formatPrice(m, "COP")}
          </Link>
        ))}
      </div>
      {failed ? (
        <p className="note">No pudimos cargar los productos. Intenta de nuevo en un rato.</p>
      ) : products.length === 0 ? (
        <p className="note">Aún no hay productos en este rango. Vuelve pronto.</p>
      ) : (
        <div className="grid">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      )}
    </main>
  );
}
