// Categorías de la portada. El slug = handle de la colección en Shopify.
// Solo se muestran las que tengan al menos un producto publicado en el canal Headless.
export type Categoria = { slug: string; nombre: string; color: string; icon: string };

export const CATEGORIAS: Categoria[] = [
  { slug: "belleza-y-cuidado", nombre: "Belleza y cuidado", color: "#FF6B5B", icon: "gift" },
  { slug: "hogar", nombre: "Hogar", color: "#FFC629", icon: "home" },
  { slug: "fitness", nombre: "Fitness", color: "#163A6B", icon: "dumbbell" },
  { slug: "tecnologia", nombre: "Tecnología", color: "#FF6B5B", icon: "phone" },
  { slug: "moda-y-accesorios", nombre: "Moda y accesorios", color: "#6B8F5E", icon: "shirt" },
  { slug: "bebes-y-ninos", nombre: "Bebés y niños", color: "#A99AD6", icon: "bear" },
];

/** Rangos de «regalo por presupuesto», en pesos colombianos. */
export const PRESUPUESTOS = [50_000, 100_000, 200_000, 300_000];
