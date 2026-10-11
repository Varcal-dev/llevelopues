import Link from "next/link";
import { POLICIES } from "@/lib/policies";
import { site, waLink } from "@/lib/site";

export default function SiteFooter() {
  const wa = waLink("Hola, quiero más información.");
  const legal = [site.razonSocial, site.nit && `NIT ${site.nit}`, site.ciudad].filter(Boolean).join(", ");
  return (
    <footer className="wrap foot">
      <div className="foot-grid">
        <div>
          <p className="foot-brand">{site.nombre}</p>
          {site.historia.length > 0 && (
            <p>
              <Link href="/quienes-somos">Quiénes somos</Link>
            </p>
          )}
        </div>
        <div>
          <p className="foot-h">Ayuda</p>
          <ul>
            {POLICIES.map((p) => (
              <li key={p.slug}>
                <Link href={`/politicas/${p.slug}`}>{p.title}</Link>
              </li>
            ))}
          </ul>
        </div>
        {(wa || site.email || site.horario || site.instagram || site.tiktok) && (
          <div>
            <p className="foot-h">Contacto</p>
            <ul>
              {wa && (
                <li>
                  <a href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                </li>
              )}
              {site.email && (
                <li>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </li>
              )}
              {site.horario && <li>{site.horario}</li>}
              {site.instagram && (
                <li>
                  <a href={`https://instagram.com/${site.instagram}`} target="_blank" rel="noopener noreferrer">Instagram</a>
                </li>
              )}
              {site.tiktok && (
                <li>
                  <a href={`https://tiktok.com/@${site.tiktok}`} target="_blank" rel="noopener noreferrer">TikTok</a>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      {site.pagos.length > 0 && <p className="foot-pay">Medios de pago: {site.pagos.join(", ")}</p>}
      <p className="foot-legal">
        {legal && `${legal}. `}© {new Date().getFullYear()} {site.nombre}
      </p>
    </footer>
  );
}
