
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export {};
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}
export default function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.fbq !== "function") return;

    window.fbq("track", "PageView");
  }, [pathname, searchParams]);

  return null;
}
