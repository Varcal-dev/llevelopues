export type Motif = "sun" | "moon" | "tag" | "snow" | "hearts" | "stars";

export type BannerCopy = {
  kicker: string;
  title: string;
  sub: string;
  cta: string;
  motif: Motif;
  bg?: string; // fondo de respaldo (sin foto) o del panel en celular
  fg?: string;
  photo?: string; // foto en /public/temporadas
  tone?: "dark" | "light"; // color del texto sobre la parte despejada de la foto
};

// La clave es el slug de la temporada (= handle de la colección en Shopify).
export const BANNERS: Record<string, BannerCopy> = {
  todo: { photo: "/temporadas/todo.webp", kicker: "Siempre hay un detalle", title: "Eso que quería, aquí está.", sub: "Regalos y cositas para ti, para ella, para él.", cta: "Ver productos", motif: "stars" },
  "regreso-a-clases": { photo: "/temporadas/regreso-a-clases.webp", kicker: "Regreso a clases", title: "Todo listo para empezar.", sub: "Útiles bonitos y organización para el año.", cta: "Ver colección", motif: "sun" },
  "san-valentin": { photo: "/temporadas/san-valentin.webp", kicker: "San Valentín", title: "Un detalle para quien quieres.", sub: "Pequeños regalos que dicen mucho.", cta: "Ver regalos", motif: "hearts" },
  "dia-del-nino": { photo: "/temporadas/dia-del-nino.webp", kicker: "Día del Niño", title: "Para los que mandan en casa.", sub: "Juegos y sorpresas para los pequeños.", cta: "Ver colección", motif: "stars", bg: "#1565C0", fg: "#FFFFFF" },
  "dia-de-la-madre": { photo: "/temporadas/dia-de-la-madre.webp", kicker: "Día de la Madre", title: "Para mamá, lo que quería.", sub: "Detalles que hablan de amor.", cta: "Ver regalos", motif: "hearts" },
  "dia-del-padre": { photo: "/temporadas/dia-del-padre.webp", kicker: "Día del Padre", title: "Sí necesita un regalo.", sub: "Solo que todavía no sabe cuál.", cta: "Ver regalos", motif: "tag" },
  "amor-y-amistad": { photo: "/temporadas/amor-y-amistad.webp", kicker: "Amor y Amistad", title: "Un detalle dice mucho.", sub: "Para el amigo secreto y para el de verdad.", cta: "Ver regalos", motif: "hearts", bg: "#C23A0B", fg: "#FFFFFF" },
  halloween: { photo: "/temporadas/halloween.webp", kicker: "Halloween", title: "Ponte creativo.", sub: "Disfraces, decoración y todo para el 31.", cta: "Ver colección", motif: "moon" },
  "black-friday": { photo: "/temporadas/black-friday.webp", tone: "light", kicker: "Black Friday", title: "Lo que estabas esperando.", sub: "Las ofertas del año, en un solo lugar.", cta: "Ver ofertas", motif: "tag" },
  navidad: { photo: "/temporadas/navidad.webp", kicker: "Navidad", title: "Prendamos diciembre.", sub: "Regalos, luces y detalles para toda la familia.", cta: "Ver regalos", motif: "snow", bg: "#B3202E", fg: "#FFF6E5" },
};

export const bannerFor = (slug: string): BannerCopy => BANNERS[slug] ?? BANNERS.todo;