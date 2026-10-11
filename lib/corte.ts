import { bogotaNow } from "@/lib/seasons";
import { site } from "@/lib/site";

// Temporadas donde no hay fecha de llegada que cumplir (no es un regalo para un día concreto).
const SIN_FECHA_DE_CORTE = new Set(["black-friday"]);

const fmtDay = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", timeZone: "UTC" });

const subBusinessDays = (from: Date, n: number) => {
  const d = new Date(from);
  while (n > 0) {
    d.setUTCDate(d.getUTCDate() - 1);
    const w = d.getUTCDay();
    if (w !== 0 && w !== 6) n--;
  }
  return d;
};

export type Corte = { texto: string; pasado: boolean };

/**
 * Último día para pagar y que el pedido llegue ANTES de la fecha del evento, usando los
 * días de entrega reales de lib/site.ts (se toma el máximo + 1 día de margen).
 * Días hábiles de lunes a viernes; no descuenta festivos. Devuelve null si no hay entregaDias.
 */
export function fechaDeCorte(slug: string, eventMs: number): Corte | null {
  if (!site.entregaDias || SIN_FECHA_DE_CORTE.has(slug)) return null;
  const limite = subBusinessDays(new Date(eventMs), site.entregaDias[1] + 1);
  const now = bogotaNow();
  const hoy = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return { texto: fmtDay.format(limite), pasado: limite.getTime() < hoy };
}
