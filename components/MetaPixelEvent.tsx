
"use client";

import { useEffect } from "react";

export {};
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

type Props = {
  event: string;
  params?: Record<string, unknown>;
};

export default function MetaPixelEvent({ event, params }: Props) {
  const serializedParams = JSON.stringify(params ?? {});

  useEffect(() => {
    if (typeof window.fbq !== "function") return;

    window.fbq("track", event, JSON.parse(serializedParams));
  }, [event, serializedParams]);

  return null;
}
