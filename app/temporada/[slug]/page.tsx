import { notFound } from "next/navigation";
import Countdown from "@/components/Countdown";
import GiftFilter from "@/components/GiftFilter";
import ProductCard from "@/components/ProductCard";
import SeasonNav from "@/components/SeasonNav";
import { fechaDeCorte } from "@/lib/corte";
import { EVERGREEN, SEASONS, getActiveSeason, getSeason, listSeasons } from "@/lib/seasons";
import { getCollectionProducts, type Product } from "@/lib/shopify";
import "../../home.css";

export const revalidate = 3600;

export function generateStaticParams() {
  return [EVERGREEN, ...SEASONS].map((s) => ({ slug: s.slug }));
}

// Las fechas de evento son UTC 00:00, por eso se formatean en UTC.
const fmt = (ms: number) => new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(ms));

export default async function SeasonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const season = getSeason(slug);
  if (!season) notFound();

  const active = getActiveSeason();
  const isActive = active.season.slug === slug;
  const slot = listSeasons().find((s) => s.season.slug === slug);
  const corte = slot ? fechaDeCorte(slug, slot.event) : null;

  let products: Product[] = [];
  let failed = false;
  try {
    products = await getCollectionProducts(slug);
  } catch {
    failed = true;
  }

  const { theme } = season;
  // La página sigue crema (piel de marca); la temporada solo aporta el color de acento.
  const vars = { "--accent": theme.accent, "--accent-ink": theme.accentInk } as React.CSSProperties;
  const groups = [{ title: "", items: products.map((p) => ({ id: p.id, tags: p.tags, node: <ProductCard p={p} /> })) }];

  return (
    <div style={vars}>
      <main>
        <section className="wrap hero">
          {(isActive && active.target) || slot ? (
            <p className="chip">
              {isActive && active.target ? (
                <Countdown target={active.target} />
              ) : slot?.status === "pasada" ? (
                <span>Vuelve el {fmt(slot.event)}</span>
              ) : slot ? (
                <span>Próxima · {fmt(slot.event)}</span>
              ) : null}
            </p>
          ) : null}
          <h1 className="section-title" style={{ paddingTop: 20 }}>{season.name}</h1>
          <p className="lead">{season.headline}</p>
          {corte && !corte.pasado && (
            <p className="cutoff">
              Para que llegue a tiempo, pídelo hasta el <strong>{corte.texto}</strong>.
            </p>
          )}
        </section>

        <section className="wrap">
          {failed ? (
            <p className="note">No pudimos cargar los productos. Revisa las variables de entorno de Shopify.</p>
          ) : products.length === 0 ? (
            <p className="note">Aún no hay productos en esta temporada. Vuelve pronto.</p>
          ) : (
            <GiftFilter groups={groups} />
          )}
        </section>

        <section className="wrap">
          <h2 className="section-title">Todas las temporadas</h2>
          <SeasonNav current={slug} />
        </section>
      </main>
    </div>
  );
}