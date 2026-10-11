import Link from "next/link";
import { notFound } from "next/navigation";
import { site, waLink } from "@/lib/site";

export const metadata = { title: "Quiénes somos — Llevelopues" };

export default function About() {
  if (site.historia.length === 0) notFound(); // sin historia real no se publica la página
  const wa = waLink("Hola, quiero saber más de la tienda.");
  return (
    <main className="wrap prose">
      <Link href="/" className="back">Volver</Link>
      <h1 className="section-title" style={{ paddingTop: 16 }}>Quiénes somos</h1>
      {site.historia.map((t, i) => (
        <p key={i}>{t}</p>
      ))}
      {site.fundador && (
        <p>
          <strong>{site.fundador}</strong>
        </p>
      )}
      {wa && (
        <p>
          <a className="ask" href={wa} target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp</a>
        </p>
      )}
    </main>
  );
}
