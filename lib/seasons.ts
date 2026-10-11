// Motor de temporadas de Llevelopues.
// El slug de cada temporada = handle de la colección en Shopify.
export type Season = {
  slug: string;
  name: string;
  headline: string;
  leadDays: number; // cuántos días antes de la fecha arranca la temporada
  event?: (year: number) => Date; // fecha del evento (UTC 00:00)
  theme: { bg: string; ink: string; accent: string; accentInk: string };
};

// n-ésimo día de la semana (0=dom … 6=sáb) de un mes (0=ene … 11=dic)
const nth = (y: number, m: number, dow: number, n: number) => {
  const offset = (dow - new Date(Date.UTC(y, m, 1)).getUTCDay() + 7) % 7;
  return new Date(Date.UTC(y, m, 1 + offset + (n - 1) * 7));
};
const last = (y: number, m: number, dow: number) => {
  const end = new Date(Date.UTC(y, m + 1, 0));
  return new Date(Date.UTC(y, m + 1, -((end.getUTCDay() - dow + 7) % 7)));
};
const fixed = (m: number, d: number) => (y: number) => new Date(Date.UTC(y, m, d));

export const EVERGREEN: Season = {
  slug: "todo",
  name: "Siempre hay un detalle",
  headline: "Eso que quería, aquí está.",
  leadDays: 0,
  theme: { bg: "#FAF6EC", ink: "#2E241E", accent: "#FFC629", accentInk: "#2E241E" },
};

export const SEASONS: Season[] = [
  { slug: "regreso-a-clases", name: "Regreso a clases", headline: "Todo listo para empezar el año.", leadDays: 21, event: fixed(0, 26), theme: { bg: "#F2F7EE", ink: "#173A1C", accent: "#2E7D32", accentInk: "#FFFFFF" } },
  { slug: "san-valentin", name: "San Valentín", headline: "Un detalle para quien quieres.", leadDays: 21, event: fixed(1, 14), theme: { bg: "#FFF0F3", ink: "#2B0A12", accent: "#D62839", accentInk: "#FFFFFF" } },
  { slug: "dia-del-nino", name: "Día del Niño", headline: "Para los que mandan en casa.", leadDays: 21, event: (y) => last(y, 3, 6), theme: { bg: "#EAF6FF", ink: "#0B2540", accent: "#1E88E5", accentInk: "#FFFFFF" } },
  { slug: "dia-de-la-madre", name: "Día de la Madre", headline: "Mamá se merece más que una tarjeta.", leadDays: 28, event: (y) => nth(y, 4, 0, 2), theme: { bg: "#FDF0F5", ink: "#3A0F24", accent: "#C2185B", accentInk: "#FFFFFF" } },
  { slug: "dia-del-padre", name: "Día del Padre", headline: "Regalos que sí va a usar.", leadDays: 21, event: (y) => nth(y, 5, 0, 3), theme: { bg: "#EEF3F8", ink: "#0D1B2A", accent: "#1F4E79", accentInk: "#FFFFFF" } },
  { slug: "amor-y-amistad", name: "Amor y Amistad", headline: "Para el amigo secreto y para el de verdad.", leadDays: 21, event: (y) => nth(y, 8, 6, 3), theme: { bg: "#FFF3E0", ink: "#3B1405", accent: "#F4511E", accentInk: "#FFFFFF" } },
  { slug: "halloween", name: "Halloween", headline: "Disfraces y dulces para el 31.", leadDays: 30, event: fixed(9, 31), theme: { bg: "#1A1423", ink: "#F5F0FF", accent: "#FF7A00", accentInk: "#1A1423" } },
  { slug: "black-friday", name: "Black Friday", headline: "Los precios más bajos del año.", leadDays: 14, event: (y) => nth(y, 10, 5, 4), theme: { bg: "#0E0E10", ink: "#FFFFFF", accent: "#FFD400", accentInk: "#0E0E10" } },
  { slug: "navidad", name: "Navidad", headline: "Novenas, velitas y regalos.", leadDays: 30, event: fixed(11, 24), theme: { bg: "#0F3D2E", ink: "#FFF6E5", accent: "#E63946", accentInk: "#FFFFFF" } },
];

const DAY = 86_400_000;
// Hora de Colombia (UTC-5, sin horario de verano): se leen los getters UTC.
export const bogotaNow = () => new Date(Date.now() - 5 * 3_600_000);

/** Temporada activa hoy y el instante en que termina su día de evento (hora de Colombia). */
export function getActiveSeason(now = bogotaNow()): { season: Season; target: number | null } {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const y = now.getUTCFullYear();
  const upcoming = [y, y + 1]
    .flatMap((yr) => SEASONS.map((season) => ({ season, event: season.event!(yr).getTime() })))
    .filter((e) => e.event >= today)
    .sort((a, b) => a.event - b.event);
  const active = upcoming.find((e) => today >= e.event - e.season.leadDays * DAY);
  // fin del día del evento en Bogotá = 00:00 UTC del día siguiente + 5 h
  return active ? { season: active.season, target: active.event + 29 * 3_600_000 } : { season: EVERGREEN, target: null };
}

/** Busca una temporada por su slug ("todo" devuelve la temporada de todo el año). */
export function getSeason(slug: string): Season | undefined {
  return slug === EVERGREEN.slug ? EVERGREEN : SEASONS.find((s) => s.slug === slug);
}

export type SeasonSlot = {
  season: Season;
  event: number; // próxima fecha del evento (UTC 00:00)
  status: "activa" | "proxima" | "pasada"; // "pasada" = ya ocurrió este año; event apunta al año siguiente
};

/** Todas las temporadas ordenadas por su próxima fecha: primero las que vienen, al final las que ya pasaron este año. */
export function listSeasons(now = bogotaNow()): SeasonSlot[] {
  const y = now.getUTCFullYear();
  const today = Date.UTC(y, now.getUTCMonth(), now.getUTCDate());
  const activeSlug = getActiveSeason(now).season.slug;
  return SEASONS.map((season): SeasonSlot => {
    const passed = season.event!(y).getTime() < today;
    const event = season.event!(passed ? y + 1 : y).getTime();
    const status = season.slug === activeSlug ? "activa" : passed ? "pasada" : "proxima";
    return { season, event, status };
  }).sort((a, b) => a.event - b.event);
}