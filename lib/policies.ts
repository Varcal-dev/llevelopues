import { site } from "@/lib/site";
import { shippingPolicyText } from "@/lib/shipping";

const cop = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

// BORRADORES. Antes de lanzar, que un abogado los revise y ajuste a lo que realmente haces (marca site.legalRevisado = true).
export type Policy = { slug: string; title: string; body: () => string[] };

const canal = () => {
  const c = [site.whatsapp && "por WhatsApp", site.email && `al correo ${site.email}`].filter(Boolean);
  return c.length ? c.join(" o ") : "por nuestros canales de atención";
};
const quien = () => [site.razonSocial || site.nombre, site.nit && `NIT ${site.nit}`].filter(Boolean).join(", ");
const clean = (xs: (string | false | "")[]) => xs.filter(Boolean) as string[];

export const POLICIES: Policy[] = [
  {
    slug: "envios",
    title: "Envíos",
    body: () =>
      clean([
        site.ciudad ? `Despachamos desde ${site.ciudad} con transportadoras aliadas dentro de Colombia.` : "Despachamos con transportadoras aliadas dentro de Colombia.",
        site.entregaDias
          ? `El tiempo estimado de entrega es de ${site.entregaDias[0]} a ${site.entregaDias[1]} días hábiles desde la confirmación del pago. Es un estimado y puede variar según la ciudad y la transportadora.`
          : "El tiempo de entrega varía según la ciudad y la transportadora.",
        shippingPolicyText(cop),
        site.rastreo && "Cuando tu pedido sale, te enviamos el número de guía para que puedas seguirlo.",
        `Si tienes dudas sobre tu pedido, escríbenos ${canal()}.`,
      ]),
  },
  {
    slug: "garantia",
    title: "Garantía",
    body: () =>
      clean([
        site.garantiaDias
          ? `Nuestros productos tienen garantía de ${site.garantiaDias} días contados desde la entrega, sin perjuicio de la garantía legal que establece la ley colombiana.`
          : "Nuestros productos cuentan con la garantía legal que establece la ley colombiana.",
        `Si tu producto llega dañado o presenta una falla, escríbenos ${canal()} con tu número de pedido y fotos o un video del problema.`,
        "Revisamos tu caso y, según corresponda, lo reparamos, lo cambiamos o te devolvemos el dinero.",
        "La garantía no cubre daños por mal uso, golpes o manipulación indebida.",
      ]),
  },
  {
    slug: "devoluciones",
    title: "Devoluciones y retracto",
    body: () => [
      "Si compraste por internet, puedes retractarte de la compra dentro de los 5 días hábiles siguientes a la entrega del producto, salvo las excepciones que establece la ley.",
      `Para hacerlo, escríbenos ${canal()} con tu número de pedido. El producto debe estar sin uso y en su empaque original.`,
      "Cuando recibimos y revisamos el producto, te devolvemos el dinero por el mismo medio de pago que usaste.",
      "Si el producto llegó con defectos, aplica la política de garantía.",
    ],
  },
  {
    slug: "terminos",
    title: "Términos y condiciones",
    body: () => [
      `Esta tienda es operada por ${quien()}.`,
      "Los precios están expresados en pesos colombianos (COP). El precio que pagas es el que ves en el momento de la compra.",
      "Los productos están sujetos a disponibilidad. Si un producto se agota después de tu pago, te contactamos para ofrecerte una alternativa o la devolución de tu dinero.",
      "Las imágenes son de referencia y pueden existir pequeñas diferencias de color o presentación.",
      "Al comprar en esta tienda aceptas estos términos.",
    ],
  },
  {
    slug: "datos",
    title: "Tratamiento de datos personales",
    body: () => [
      `${quien()} es responsable del tratamiento de tus datos personales${site.email ? `. Puedes contactarnos en ${site.email}` : ""}.`,
      "Usamos tus datos para procesar y entregar tu pedido, atender tus solicitudes y, si lo autorizas, enviarte información de la tienda.",
      "Compartimos tus datos con los proveedores, transportadoras y pasarelas de pago que intervienen en tu compra, únicamente para completarla.",
      `Como titular tienes derecho a conocer, actualizar, rectificar y suprimir tus datos, y a revocar tu autorización, escribiéndonos ${canal()}.`,
    ],
  },
];

export const getPolicy = (slug: string) => POLICIES.find((p) => p.slug === slug);