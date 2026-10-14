"use client";
import { useState } from "react";
import "./promo.css";

// Botón «Copiar» para un código de cupón. Si el navegador no deja copiar, el código sigue visible para copiarlo a mano.
export default function CopyCode({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };
  return (
    <button type="button" className="promo-copy" onClick={copiar} aria-live="polite">
      {copiado ? "¡Copiado!" : "Copiar"}
    </button>
  );
}
