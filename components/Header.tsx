import Link from "next/link";
import Logo from "./Logo";
import CartButton from "./CartButton";
import { site } from "@/lib/site";
import "./header.css";

// Solo se enlaza a lo que existe de verdad.
const links = () => [
  { href: "/", label: "Inicio" },
  { href: "/#temporadas", label: "Temporadas" },
  { href: "/#productos", label: "Regalos" },
  ...(site.historia.length > 0 ? [{ href: "/quienes-somos", label: "Quiénes somos" }] : []),
];

export default function Header() {
  const items = links();
  return (
    <header className="site-header">
      <div className="wrap hd">
        <details className="hd-menu">
          <summary aria-label="Menú">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </summary>
          <nav className="hd-drop" aria-label="Menú principal">
            {items.map((i) => <Link key={i.href} href={i.href}>{i.label}</Link>)}
          </nav>
        </details>

        <Logo height={44} />

        <nav className="hd-nav" aria-label="Menú principal">
          {items.map((i) => <Link key={i.href} href={i.href}>{i.label}</Link>)}
        </nav>

        <form className="hd-search" action="/buscar" role="search">
          <input type="search" name="q" placeholder="¿Qué estás buscando?" aria-label="Buscar productos" autoComplete="off" />
          <button type="submit" aria-label="Buscar">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
            </svg>
          </button>
        </form>

        <CartButton />
      </div>
    </header>
  );
}
