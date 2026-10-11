"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { CART_EVENT, readCount } from "@/lib/cart-client";
import "./cart.css";

const subscribe = (cb: () => void) => {
  window.addEventListener(CART_EVENT, cb);
  return () => window.removeEventListener(CART_EVENT, cb);
};

export default function CartButton() {
  const n = useSyncExternalStore(subscribe, readCount, () => 0);
  return (
    <Link href="/carrito" className="cart-btn" aria-label={n > 0 ? `Carrito, ${n} productos` : "Carrito"}>
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 7h12l-1 13H7L6 7Z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
      {n > 0 && <span className="cart-badge">{n}</span>}
    </Link>
  );
}
