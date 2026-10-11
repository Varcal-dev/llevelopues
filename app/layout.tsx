import type { Metadata } from "next";
import { Baloo_2, Karla } from "next/font/google";
import { getActiveSeason } from "@/lib/seasons";
import { missingSiteFields } from "@/lib/site";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";

const display = Baloo_2({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "800"],
});
const body = Karla({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://llevelopues.com",
  ),
  title: {
    default: "Llévelo pues | Eso que quería, aquí está",
    template: "%s | Llévelo pues",
  },
  description:
    "Regalos y productos para cada fecha del año, con pago en línea y envío a toda Colombia.",
  applicationName: "Llévelo pues",
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Llévelo pues",
    title: "Llévelo pues | Eso que quería, aquí está",
    description:
      "Descubre productos para cada temporada. Eso que quería, aquí está.",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "Llévelo pues — Eso que quería, aquí está",
      },
    ],
  },
  robots: { index: true, follow: true },
};

// En desarrollo, la terminal avisa qué datos reales faltan en lib/site.ts
if (process.env.NODE_ENV === "development") {
  const missing = missingSiteFields();
  if (missing.length > 0)
    console.warn(`[site] Falta en lib/site.ts: ${missing.join(", ")}`);
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // La piel de la marca no cambia: página siempre crema con tinta café. De la temporada solo se toman los acentos (botones, etiquetas).
  const { theme } = getActiveSeason().season;
  const vars = {
    "--bg": "#FAF6EC",
    "--ink": "#2E241E",
    "--accent": theme.accent,
    "--accent-ink": theme.accentInk,
  } as React.CSSProperties;
  return (
    <html lang="es-CO" className={`${display.variable} ${body.variable}`}>
      <body style={vars}>
        <Header />
        {children}
        <SiteFooter />
        <WhatsAppButton />
      </body>
    </html>
  );
}
