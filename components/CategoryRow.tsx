import Link from "next/link";
import { CATEGORIAS } from "@/lib/categorias";
import { getCollectionProducts } from "@/lib/shopify";
import CategoryIcon from "./CategoryIcon";

// Muestra solo las categorías que tienen productos reales: nada de círculos que llevan a páginas vacías.
export default async function CategoryRow() {
  const checks = await Promise.all(
    CATEGORIAS.map(async (c) => {
      try {
        return (await getCollectionProducts(c.slug, 1)).length > 0;
      } catch {
        return false;
      }
    }),
  );
  const visibles = CATEGORIAS.filter((_, i) => checks[i]);
  if (visibles.length === 0) return null;
  return (
    <nav className="cats" aria-label="Categorías">
      {visibles.map((c) => (
        <Link key={c.slug} href={`/categoria/${c.slug}`}>
          <span className="cat-dot" style={{ background: c.color }}><CategoryIcon name={c.icon} /></span>
          <span className="cat-name">{c.nombre}</span>
        </Link>
      ))}
    </nav>
  );
}
