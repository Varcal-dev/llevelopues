// Contenido emocional por producto (clave = handle del producto en Shopify).
// REGLA: cada frase debe ser verdad para el producto real. Verifica con la ficha y con tu muestra antes de publicar.
export type ProductContent = {
  gancho: string; // una frase bajo el título: el resultado, no la ficha técnica
  sensaciones: { titulo: string; texto: string }[]; // máximo 3
  preguntas?: { q: string; a: string }[]; // agrega medidas, capacidad, etc. cuando las hayas verificado
};

export const CONTENT: Record<string, ProductContent> = {
  "deshumidificador-pequeno-potente-hogar": {
    gancho: "Un aire más liviano en casa: menos humedad y menos olor a encerrado.",
    sensaciones: [
      { titulo: "Entras y se siente distinto", texto: "Al bajar la humedad del cuarto, el ambiente se siente más limpio y deja de oler a guardado." },
      { titulo: "Ropa y closet en mejor estado", texto: "Con menos humedad en el aire, la ropa seca mejor y el closet no se llena de ese olor a humedad." },
      { titulo: "Lo pones donde lo necesitas", texto: "Es pequeño: lo llevas al cuarto, al baño o al cuarto de la ropa, según donde más humedad tengas." },
    ],
  },
};
