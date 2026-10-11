// «¿Para quién es?»: cada opción se activa con una etiqueta en Shopify (Productos > etiquetas).
// Un producto puede tener varias, ej. "para-mama" y "para-casa". Sin etiquetas solo aparece en «Todos».
export const DESTINATARIOS = [
  { key: "mama", label: "Mamá", tag: "para-mama" },
  { key: "papa", label: "Papá", tag: "para-papa" },
  { key: "ninos", label: "Niños", tag: "para-ninos" },
  { key: "pareja", label: "Pareja", tag: "para-pareja" },
  { key: "casa", label: "Mi casa", tag: "para-casa" },
] as const;
