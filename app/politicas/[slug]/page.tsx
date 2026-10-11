import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { POLICIES, getPolicy } from "@/lib/policies";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return POLICIES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) return { title: "Página no encontrada", robots: { index: false } };
  return {
    title: `${policy.title} — ${site.nombre}`,
    alternates: { canonical: `/politicas/${policy.slug}` },
  };
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) notFound();

  return (
    <main className="wrap prose">
      <Link href="/" className="back">Volver</Link>
      <h1 className="section-title" style={{ paddingTop: 16 }}>{policy.title}</h1>
      {policy.body().map((t, i) => (
        <p key={i}>{t}</p>
      ))}
    </main>
  );
}