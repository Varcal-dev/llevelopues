import Link from "next/link";
import { PRESUPUESTOS } from "@/lib/categorias";
import { getAllProducts } from "@/lib/catalogo";
import { formatPrice } from "@/lib/shopify";

// «Busca el regalo ideal por presupuesto»: solo aparecen los rangos que tienen productos.
export default async function BudgetRow() {
  let precios: number[] = [];
  try {
    precios = (await getAllProducts()).map((p) => p.price);
  } catch {
    return null;
  }
  const rangos = PRESUPUESTOS.map((max) => ({ max, n: precios.filter((p) => p <= max).length })).filter((r) => r.n > 0);
  if (rangos.length === 0) return null;
  return (
    <section className="wrap budget">
      <h2 className="section-title">Busca el regalo ideal por presupuesto</h2>
      <div className="budget-row">
        {rangos.map((r) => (
          <Link key={r.max} href={`/regalos?hasta=${r.max}`} className="budget-card">
            <small>Regalos hasta</small>
            <strong>{formatPrice(r.max, "COP")}</strong>
            <span aria-hidden="true">→</span>
            <em>{r.n} {r.n === 1 ? "producto" : "productos"}</em>
          </Link>
        ))}
      </div>
    </section>
  );
}
