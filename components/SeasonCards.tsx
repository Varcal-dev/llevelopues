import Link from "next/link";
import Image from "next/image";
import { listSeasons } from "@/lib/seasons";
import { bannerFor } from "@/lib/banners";

// «Colecciones por temporada»: una tarjeta con foto por cada temporada, la activa primero.
export default function SeasonCards() {
  const slots = listSeasons();
  const ordered = [...slots.filter((s) => s.status === "activa"), ...slots.filter((s) => s.status !== "activa")];
  return (
    <div className="season-cards">
      {ordered.map(({ season, status }) => {
        const photo = bannerFor(season.slug).photo;
        return (
          <Link key={season.slug} href={`/temporada/${season.slug}`} className="season-card" style={{ background: season.theme.accent, color: season.theme.accentInk }}>
            {photo && <Image src={photo} alt="" fill sizes="(min-width: 900px) 25vw, 50vw" />}
            <span className="sc-shade" aria-hidden="true" />
            {status === "activa" && <span className="sc-now">Ahora</span>}
            <span className="sc-text">
              <strong>{season.name}</strong>
              <small>{season.headline}</small>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
