import { cache } from "react";
import { storefront } from "@/lib/shopify";
import { PROMOS, ahora, type Promo } from "@/lib/promos";

// La Storefront API no dice qué descuento aplica a cada producto. Lo resolvemos por colección:
// se piden los productos de cada colección que tenga promo y se arma un mapa handle → promos.
const QUERY = `
  query ($handle: String!) {
    collection(handle: $handle) {
      products(first: 100) { nodes { handle } }
    }
  }`;

type Data = { collection: null | { products: { nodes: { handle: string }[] } } };

/** handle de producto → promos de las colecciones a las que pertenece (solo las que aún no vencen). */
export const getPromoMap = cache(async (): Promise<Map<string, Promo[]>> => {
  const now = ahora();
  const map = new Map<string, Promo[]>();
  await Promise.all(
    PROMOS.filter((p) => now < p.hasta).map(async (promo) => {
      try {
        const data = await storefront<Data>(QUERY, { handle: promo.coleccion });
        for (const n of data?.collection?.products.nodes ?? []) {
          map.set(n.handle, [...(map.get(n.handle) ?? []), promo]);
        }
      } catch {
        // Sin conexión con Shopify: esa promo no se muestra en los productos, pero la página sigue funcionando.
      }
    }),
  );
  for (const list of map.values()) list.sort((a, b) => a.desde - b.desde);
  return map;
});

export async function promosDeProducto(handle: string): Promise<Promo[]> {
  return (await getPromoMap()).get(handle) ?? [];
}
