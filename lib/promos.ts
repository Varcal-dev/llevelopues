// Promos de la tienda. Cada una es un CÓDIGO MANUAL creado en Shopify (Descuentos) que aplica a UNA colección.
//
// REGLA DE ORO: el código, el porcentaje, la colección y las fechas de aquí deben ser IGUALES a los del descuento en Shopify.
// Si no coinciden, la web anunciaría un código que Shopify rechaza. Las fechas son las de «Fecha de inicio/fin» del descuento.
//
// Para agregar una promo nueva:
//   1) Crea el descuento en Shopify: código, % y «Aplica a: colecciones específicas».
//   2) Agrega una entrada aquí con las mismas fechas (en ISO con zona: Colombia es -05:00).
//   3) Publica la colección en el canal Headless (si no, la web no sabe qué productos aplican).
import { CATEGORIAS } from "@/lib/categorias";

export type Promo = {
  codigo: string; // tal cual está en Shopify (la comparación no distingue mayúsculas)
  coleccion: string; // handle de la colección en Shopify
  nombre: string; // cómo se llama la colección en los textos: «productos de {nombre}»
  porcentaje: number; // 10 = 10 %
  desde: number; // ms: cuándo empieza a servir el código
  hasta: number; // ms: cuándo deja de servir
};

const t = (iso: string) => Date.parse(iso);

export const PROMOS: Promo[] = [
  { codigo: "HALLOWEEN10", coleccion: "halloween", nombre: "Halloween", porcentaje: 10, desde: t("2026-10-19T00:00:00-05:00"), hasta: t("2026-10-31T23:59:00-05:00") },
  { codigo: "BLACKFRIDAY15", coleccion: "black-friday", nombre: "Black Friday", porcentaje: 15, desde: t("2026-11-25T00:00:00-05:00"), hasta: t("2026-11-30T23:59:00-05:00") },
  { codigo: "NAVIDAD10", coleccion: "navidad", nombre: "Navidad", porcentaje: 10, desde: t("2026-12-01T00:00:00-05:00"), hasta: t("2026-12-23T23:59:00-05:00") },
];

/** Días antes del inicio en que la web ya anuncia «Desde el X: …». */
export const AVISO_DIAS = 7;
const DIA = 86_400_000;

export type Fase = "aviso" | "activa" | null; // null = todavía no se anuncia, o ya venció

export function faseDe(p: Pick<Promo, "desde" | "hasta">, now: number): Fase {
  if (now >= p.hasta) return null;
  if (now >= p.desde) return "activa";
  if (now >= p.desde - AVISO_DIAS * DIA) return "aviso";
  return null;
}

/** El reloj, en una función aparte para poder usarlo desde los componentes de servidor. */
export const ahora = () => Date.now();

/** Las promos que todavía no vencen (las que ya pasaron no se mandan al navegador). */
export const promosVigentes = (now = ahora()) => PROMOS.filter((p) => now < p.hasta);

/** Precio unitario con el descuento, redondeado al peso. */
export const precioConCodigo = (precio: number, porcentaje: number) => Math.round(precio * (1 - porcentaje / 100));

// Formato fijo en hora de Colombia: servidor y navegador dicen lo mismo.
const fmtDia = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", timeZone: "America/Bogota" });
export const textoFecha = (ms: number) => fmtDia.format(new Date(ms));

/** Página donde se ven los productos de la promo: la categoría o la temporada con ese mismo handle. */
export const rutaDe = (p: Pick<Promo, "coleccion">) =>
  CATEGORIAS.some((c) => c.slug === p.coleccion) ? `/categoria/${p.coleccion}` : `/temporada/${p.coleccion}`;

export const textoAlcance = (p: Pick<Promo, "nombre">) => `productos de ${p.nombre}`;

/** Por qué un código que Shopify no aceptó no sirve ahora. null si la web no lo conoce. */
export function explicarCodigo(codigo: string, now = ahora()): string | null {
  const p = PROMOS.find((x) => x.codigo.toUpperCase() === codigo.toUpperCase());
  if (!p) return null;
  if (now >= p.hasta) return `${p.codigo} ya venció.`;
  if (now < p.desde) return `${p.codigo} empieza el ${textoFecha(p.desde)}.`;
  return `${p.codigo} solo aplica a ${textoAlcance(p)}, y no hay ninguno en tu carrito.`;
}
