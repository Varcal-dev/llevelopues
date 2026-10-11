import { bogotaNow } from "@/lib/seasons";

// Datos REALES de la tienda. Llena solo lo que sea verdad: lo que quede vacío no se muestra en la web.
// En desarrollo (npm run dev) la terminal te avisa qué falta.
export const site = {
  nombre: "Llevelopues",
  ciudad: "", // ciudad desde donde despachas, ej. "Ciudad, Departamento"
  razonSocial: "", // nombre legal con el que vendes
  nit: "", // NIT de esa razón social
  whatsapp: "", // solo dígitos con indicativo de país, ej. "573001234567"
  email: "", // ej. "hola@llevelopues.com" o "info@llevelopues.com" (debe ser un buzón que sí revises)
  horario: "Pedidos en línea las 24 horas", // ej. "Lunes a sábado, 8 a. m. a 6 p. m."
  instagram: "", // usuario sin @
  tiktok: "", // usuario sin @
  pagos: [] as string[], // SOLO los medios que tengas activos, ej. ["PSE", "Nequi", "Tarjetas", "Addi"]
  garantiaDias: 0, // días de garantía que de verdad ofreces; 0 = no se muestra
  entregaDias: [3, 7] as [number, number] | null, // días hábiles reales, ej. [3, 7]. Usa tiempos conservadores
  rastreo: false, // true solo si envías el número de guía al cliente
  historia: [] as string[], // párrafos de «Quiénes somos»: tu historia real, en tus palabras
  fundador: "", // nombre de quien da la cara
  legalRevisado: false, // pásalo a true cuando un abogado haya validado las políticas de lib/policies.ts
};

export const waLink = (msg: string) => (site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(msg)}` : null);

const addBusinessDays = (from: Date, n: number) => {
  const d = new Date(from);
  while (n > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const w = d.getUTCDay();
    if (w !== 0 && w !== 6) n--;
  }
  return d;
};
const fmtDay = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", timeZone: "UTC" });

/** Rango estimado de entrega si el cliente paga hoy (días hábiles; no descuenta festivos). */
export function entregaEstimada(): string | null {
  if (!site.entregaDias) return null;
  const now = bogotaNow();
  const [a, b] = site.entregaDias;
  return `entre el ${fmtDay.format(addBusinessDays(now, a))} y el ${fmtDay.format(addBusinessDays(now, b))}`;
}

export function missingSiteFields(): string[] {
  const m: string[] = [];
  (["razonSocial", "nit", "ciudad", "whatsapp", "email", "horario", "fundador"] as const).forEach((k) => {
    if (!site[k]) m.push(k);
  });
  if (site.pagos.length === 0) m.push("pagos");
  if (!site.garantiaDias) m.push("garantiaDias");
  if (!site.entregaDias) m.push("entregaDias");
  if (site.historia.length === 0) m.push("historia");
  if (!site.legalRevisado) m.push("legalRevisado (que un abogado revise las políticas)");
  return m;
}