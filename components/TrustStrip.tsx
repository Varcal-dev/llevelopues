import { site } from "@/lib/site";

// Solo muestra lo que está configurado en lib/site.ts, o sea, lo que es verdad.
export default function TrustStrip({ row = false }: { row?: boolean }) {
  const items = [
    site.pagos.length > 0 && `Pago seguro: ${site.pagos.join(", ")}`,
    site.rastreo && "Envío con número de guía",
    site.garantiaDias > 0 && `Garantía de ${site.garantiaDias} días`,
    site.whatsapp && "Te respondemos por WhatsApp",
  ].filter(Boolean) as string[];
  if (items.length === 0) return null;
  return (
    <ul className={row ? "trust row" : "trust"}>
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}
