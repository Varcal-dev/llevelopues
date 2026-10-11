import Image from "next/image";
import CountdownCard from "./CountdownCard";
import { bannerFor, type Motif } from "@/lib/banners";
import type { Season } from "@/lib/seasons";
import "./banner.css";

// Estrella de 5 puntas como lista de puntos para <polygon>
const star = (cx: number, cy: number, R: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const d = i % 2 ? r : R;
    return `${(cx + d * Math.cos(a)).toFixed(1)},${(cy + d * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

const HEART = "M50 88C20 62 4 46 4 28A22 22 0 0 1 50 22A22 22 0 0 1 96 28C96 46 80 62 50 88Z";

function MotifArt({ motif }: { motif: Motif }) {
  const hole = { fill: "var(--b-bg)" };
  switch (motif) {
    case "sun":
      return (
        <>
          <circle cx="100" cy="100" r="38" />
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1="100" y1="34" x2="100" y2="14" strokeWidth="9" strokeLinecap="round" stroke="currentColor" transform={`rotate(${i * 45} 100 100)`} />
          ))}
        </>
      );
    case "moon":
      return (
        <>
          <path d="M118 22A82 82 0 1 0 176 146A66 66 0 0 1 118 22Z" />
          <polygon points={star(150, 84, 14, 6)} />
          <polygon points={star(40, 36, 10, 4)} />
        </>
      );
    case "tag":
      return (
        <g transform="rotate(-12 100 100)">
          <polygon points="26,46 142,46 180,100 142,154 26,154" />
          <text x="98" y="122" fontSize="66" fontWeight="800" textAnchor="middle" style={hole}>%</text>
        </g>
      );
    case "snow":
      return (
        <>
          <polygon points={star(100, 100, 46, 18)} />
          <polygon points={star(40, 46, 18, 7)} />
          <polygon points={star(164, 52, 14, 6)} />
          <polygon points={star(158, 160, 20, 8)} />
          {[[24, 130], [80, 176], [180, 106], [120, 22]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="5" />)}
        </>
      );
    case "hearts":
      return (
        <>
          <g transform="translate(18 62) scale(1.3)"><path d={HEART} /></g>
          <g transform="translate(128 18) scale(.55)"><path d={HEART} /></g>
          <g transform="translate(152 104) scale(.4)"><path d={HEART} /></g>
        </>
      );
    default:
      return (
        <>
          <polygon points={star(84, 104, 56, 22)} />
          <polygon points={star(160, 54, 22, 9)} />
          <polygon points={star(158, 156, 16, 6)} />
        </>
      );
  }
}

type Props = {
  season: Season;
  target?: number | null; // fin del día del evento (ms); muestra la cuenta regresiva
  deadline?: string; // p. ej. "Pide antes del 28 de octubre para recibir a tiempo"
  href?: string;
};

export default function SeasonBanner({ season, target = null, deadline, href = "#productos" }: Props) {
  const b = bannerFor(season.slug);
  const light = b.tone === "light";
  // Con foto: el texto va sobre la zona despejada (escritorio) o en un panel debajo de la foto (celular).
  const vars = {
    "--b-bg": b.photo ? (light ? "#0E0E10" : "#FAF6EC") : (b.bg ?? season.theme.accent),
    "--b-fg": b.photo ? (light ? "#FFF6E5" : "#2E241E") : (b.fg ?? season.theme.accentInk),
    "--b-chip": season.theme.accent,
    "--b-chip-ink": season.theme.accentInk,
  } as React.CSSProperties;
  return (
    <section className={`banner wrap-banner${b.photo ? " has-photo" : ""}${light ? " tone-light" : ""}`} style={vars}>
      {b.photo ? (
        <div className="banner-photo">
          <Image src={b.photo} alt="" fill priority sizes="(min-width: 1100px) 1060px, 100vw" />
        </div>
      ) : (
        <svg className="motif" viewBox="0 0 200 200" fill="currentColor" aria-hidden="true">
          <MotifArt motif={b.motif} />
        </svg>
      )}
      <div className="banner-body">
        <p className="kicker">
          <span className="chip-b">{b.kicker}</span>
        </p>
        <h1>{b.title}</h1>
        <p className="sub">{b.sub}</p>
        {deadline && <p className="deadline">{deadline}</p>}
        <a className="cta" href={href}>{b.cta}</a>
      </div>
      {target && <CountdownCard target={target} name={season.name} />}
    </section>
  );
}
