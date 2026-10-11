import Link from "next/link";
import { shipping, shippingProgress } from "@/lib/shipping";
import { formatPrice } from "@/lib/shopify";

// Barra de progreso hacia el envío gratis. Es un componente de servidor: no necesita JS en el navegador.
export default function FreeShippingBar({ subtotal, currency }: { subtotal: number; currency: string }) {
  const { free, missing, percent } = shippingProgress(subtotal);
  return (
    <div className={free ? "ship-bar done" : "ship-bar"}>
      <p>
        {free ? (
          <strong>¡Tienes envío gratis!</strong>
        ) : (
          <>
            Te faltan <strong>{formatPrice(missing, currency)}</strong> para el envío gratis
          </>
        )}
      </p>
      <div
        className="ship-track"
        role="progressbar"
        aria-label="Progreso hacia el envío gratis"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
      {!free && (
        <Link className="ship-more" href="/">
          Agregar más productos
        </Link>
      )}
      <small>
        Envío gratis desde {formatPrice(shipping.gratisDesde, currency)}; por debajo, {formatPrice(shipping.tarifa, currency)}.
      </small>
    </div>
  );
}
