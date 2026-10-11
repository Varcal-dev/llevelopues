// Utilidades del lado del navegador para el contador del carrito (cookie "llp_count").
export const CART_EVENT = "llp:cart";

export const readCount = () => {
  const m = document.cookie.match(/(?:^|; )llp_count=(\d+)/);
  return m ? Number(m[1]) : 0;
};
export const writeCount = (n: number) => {
  document.cookie = `llp_count=${n}; path=/; max-age=2592000; samesite=lax`;
};
export const notifyCart = () => window.dispatchEvent(new Event(CART_EVENT));
