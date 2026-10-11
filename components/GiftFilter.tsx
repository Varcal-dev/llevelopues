"use client";
import { useState, type ReactNode } from "react";
import { DESTINATARIOS } from "@/lib/destinatarios";

export type FilterItem = { id: string; tags: string[]; node: ReactNode };
export type FilterGroup = { title: string; items: FilterItem[] };

export default function GiftFilter({ groups }: { groups: FilterGroup[] }) {
  const [sel, setSel] = useState<string | null>(null);
  const has = (it: FilterItem, tag: string) => it.tags.some((t) => t.toLowerCase() === tag);
  const all = groups.flatMap((g) => g.items);
  const chips = DESTINATARIOS.map((d) => ({ ...d, n: all.filter((i) => has(i, d.tag)).length })).filter((d) => d.n > 0);
  const dest = chips.find((c) => c.key === sel);
  const visible = groups
    .map((g) => ({ ...g, items: dest ? g.items.filter((i) => has(i, dest.tag)) : g.items }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      {chips.length >= 2 && ( // con menos de 2 opciones el selector estorba más de lo que ayuda
        <div className="who" role="group" aria-label="¿Para quién es?">
          <p className="who-q">¿Para quién es?</p>
          <div className="who-row">
            <button type="button" aria-pressed={!dest} onClick={() => setSel(null)}>
              Todos
            </button>
            {chips.map((c) => (
              <button key={c.key} type="button" aria-pressed={sel === c.key} onClick={() => setSel(c.key)}>
                {c.label}
                <small>{c.n}</small>
              </button>
            ))}
          </div>
        </div>
      )}
      {visible.map((g) => (
        <section key={g.title}>
          {g.title && <h2 className="section-title">{g.title}</h2>}
          <div className="grid">
            {g.items.map((i) => (
              <div key={i.id} style={{ display: "contents" }}>
                {i.node}
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
