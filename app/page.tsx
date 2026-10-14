import Link from "next/link";
import { EVERGREEN, getActiveSeason, listSeasons } from "@/lib/seasons";
import { getCollectionProducts, type Product } from "@/lib/shopify";
import { fechaDeCorte } from "@/lib/corte";
import { site } from "@/lib/site";
import { ahora, promosVigentes } from "@/lib/promos";
import GiftFilter, { type FilterGroup } from "@/components/GiftFilter";
import ProductCard from "@/components/ProductCard";
import PromoStrip from "@/components/PromoStrip";
import SeasonBanner from "@/components/SeasonBanner";
import SeasonCards from "@/components/SeasonCards";
import CategoryRow from "@/components/CategoryRow";
import BudgetRow from "@/components/BudgetRow";
import TrustStrip from "@/components/TrustStrip";
import "./home.css";
import "@/components/home-sections.css";

export const revalidate = 3600; // la temporada se recalcula cada hora

const toItems = (ps: Product[]) =>
  ps.map((p) => ({ id: p.id, tags: p.tags, node: <ProductCard p={p} /> }));

export default async function Home() {
  const renderedAt = ahora();
  const { season, target } = getActiveSeason();
  const onlyEvergreen = season.slug === EVERGREEN.slug;
  let seasonal: Product[] = [];
  let always: Product[] = [];
  let failed = false;
  try {
    const [s, a] = await Promise.all([
      onlyEvergreen
        ? Promise.resolve([] as Product[])
        : getCollectionProducts(season.slug),
      getCollectionProducts(EVERGREEN.slug),
    ]);
    const seen = new Set(s.map((p) => p.id));
    seasonal = s;
    always = a.filter((p) => !seen.has(p.id)); // sin duplicados si un producto está en ambas colecciones
  } catch {
    failed = true;
  }

  const groups: FilterGroup[] = [
    { title: season.name, items: toItems(seasonal) },
    { title: EVERGREEN.name, items: toItems(always) },
  ].filter((g) => g.items.length > 0);

  const slot = onlyEvergreen
    ? undefined
    : listSeasons().find((s) => s.season.slug === season.slug);
  const corte = slot ? fechaDeCorte(season.slug, slot.event) : null;
  const deadline = corte
    ? corte.pasado
      ? "La fecha límite para recibirlo a tiempo ya pasó."
      : `Haz tu pedido hasta el ${corte.texto} para recibirlo a tiempo.`
    : undefined;

  return (
    <main>
      <section className="wrap">
        <SeasonBanner season={season} target={target} deadline={deadline} href="#productos" />
      </section>

      <div className="wrap">
        <CategoryRow />
        <TrustStrip row />
      </div>

      <div className="wrap">
        {/* Todas las promos vigentes o por empezar (el navegador filtra por la hora real). */}
        <PromoStrip promos={promosVigentes(renderedAt)} renderedAt={renderedAt} />
      </div>

      <section className="wrap" id="productos">
        {failed ? (
          <p className="note">
            No pudimos cargar los productos. Revisa las variables de entorno de
            Shopify.
          </p>
        ) : groups.length === 0 ? (
          <p className="note">
            Aún no hay productos. Crea las colecciones «{season.slug}» y «
            {EVERGREEN.slug}» en Shopify, agrega productos y publícalas en el
            canal Headless.
          </p>
        ) : (
          <GiftFilter groups={groups} />
        )}
      </section>

      <BudgetRow />

      {site.historia.length > 0 && (
        <section className="wrap prose">
          <h2 className="section-title">Quién está detrás</h2>
          <p>{site.historia[0]}</p>
          <p>
            <Link className="ask" href="/quienes-somos">
              Conoce nuestra historia
            </Link>
          </p>
        </section>
      )}

      <section className="wrap" id="temporadas">
        <h2 className="section-title">Colecciones por temporada</h2>
        <SeasonCards />
      </section>
    </main>
  );
}
