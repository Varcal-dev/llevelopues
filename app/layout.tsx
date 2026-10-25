import type { Metadata } from "next";
import { Suspense } from "react";
import { Baloo_2, Karla } from "next/font/google";
import Script from "next/script";
import { getActiveSeason } from "@/lib/seasons";
import { missingSiteFields } from "@/lib/site";
import { ahora, promosVigentes } from "@/lib/promos";
import Header from "@/components/Header";
import PromoBar from "@/components/PromoBar";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import MetaPixel from "@/components/MetaPixel";
import "./globals.css";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

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
  const { theme } = getActiveSeason().season;
  const renderedAt = ahora();
  const promos = promosVigentes(renderedAt);
  const vars = {
    "--bg": "#FAF6EC",
    "--ink": "#2E241E",
    "--accent": theme.accent,
    "--accent-ink": theme.accentInk,
  } as React.CSSProperties;
  return (
    <html lang="es-CO" className={`${display.variable} ${body.variable}`}>
      <body style={vars}>
        {PIXEL_ID && (
          <>
            {/* Solo carga e inicializa. El PageView lo dispara <MetaPixel /> en cada ruta. */}
            <Script id="meta-pixel" strategy="beforeInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${PIXEL_ID}');
              `}
            </Script>
            <Suspense fallback={null}>
              <MetaPixel />
            </Suspense>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                alt=""
                src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}
        <PromoBar promos={promos} renderedAt={renderedAt} />
        <Header />
        {children}
        <SiteFooter />
        <WhatsAppButton />
      </body>
    </html>
  );
}