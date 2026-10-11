import Link from "next/link";
import { EVERGREEN, listSeasons } from "@/lib/seasons";

export default function SeasonNav({ current }: { current?: string }) {
  const items = [
    { slug: EVERGREEN.slug, name: "Todo el año", note: "" },
    ...listSeasons().map(({ season, status }) => ({
      slug: season.slug,
      name: season.name,
      note: status === "activa" ? "ahora" : "",
    })),
  ];
  return (
    <nav className="seasons" aria-label="Temporadas">
      {items.map((i) => (
        <Link key={i.slug} href={`/temporada/${i.slug}`} aria-current={current === i.slug ? "page" : undefined}>
          {i.name}
          {i.note && <small>{i.note}</small>}
        </Link>
      ))}
    </nav>
  );
}