import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { searchProducts } from "@/lib/search";
import type { Product } from "@/lib/shopify";

export const metadata = { title: "Buscar — Llévelo pues" };

export default async function Buscar({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const term = q.trim();
  let results: Product[] = [];
  let failed = false;
  if (term) {
    try {
      results = await searchProducts(term);
    } catch {
      failed = true;
    }
  }
  return (
    <main className="wrap">
      <h1 className="section-title">{term ? `Resultados para «${term}»` : "¿Qué estás buscando?"}</h1>
      {failed ? (
        <p className="note">No pudimos buscar en este momento. Intenta de nuevo en un rato.</p>
      ) : !term ? (
        <p className="note">Escribe en el buscador el nombre de un producto o una ocasión.</p>
      ) : results.length === 0 ? (
        <p className="note">
          No encontramos nada con esa búsqueda. Prueba con otra palabra o mira <Link href="/#temporadas" className="ask">las temporadas</Link>.
        </p>
      ) : (
        <div className="grid">
          {results.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </main>
  );
}
