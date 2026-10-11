"use client";
import { useEffect } from "react";
import { notifyCart, writeCount } from "@/lib/cart-client";

// En /carrito deja el globito del header igual a lo que realmente hay en el carrito.
export default function CartCountSync({ count }: { count: number }) {
  useEffect(() => {
    writeCount(count);
    notifyCart();
  }, [count]);
  return null;
}
