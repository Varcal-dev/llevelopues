"use client";

type Props = { href: string; value: number; currency: string; contentIds: string[] };


export default function CheckoutButton({ href, value, currency, contentIds }: Props) {
  function handleCheckout(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    window.fbq?.("track", "InitiateCheckout", {
      value, currency, content_ids: contentIds, content_type: "product",
    });
    window.setTimeout(() => window.location.assign(href), 200);
  }
  return <a className="ask" href={href} onClick={handleCheckout}>Ir a pagar</a>;
}