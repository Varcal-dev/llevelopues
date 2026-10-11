import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { CATEGORIAS } from "@/lib/categorias";
import { getCollectionProducts, type Product } from "@/lib/shopify";

export const revalidate = 3600;

export function generateStaticParams() {
  return CATEGORIAS.map((c) => ({ slug: c.slug }));
}

export default async function Categoria({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = CATEGORIAS.find((c) => c.slug === slug);
  if (!cat) notFound();
  let products: Product[] = [];
  let failed = false;
  try {
    products = await getCollectionProducts(slug, 48);
  } catch {
    failed = true;
  }
  return (
    <main className="wrap">
      <Link href="/" className="back">Volver</Link>
      <h1 className="section-title" style={{ paddingTop: 16 }}>{cat.nombre}</h1>
      {failed ? (
        <p className="note">No pudimos cargar los productos. Intenta de nuevo en un rato.</p>
      ) : products.length === 0 ? (
        <p className="note">Aún no hay productos en esta categoría. Vuelve pronto.</p>
      ) : (
        <div className="grid">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      )}
    </main>
  );
}
