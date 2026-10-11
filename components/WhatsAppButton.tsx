import { waLink } from "@/lib/site";

export default function WhatsAppButton() {
  const href = waLink("Hola, quiero más información.");
  if (!href) return null;
  return (
    <a className="wa" href={href} target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp">
      WhatsApp
    </a>
  );
}
