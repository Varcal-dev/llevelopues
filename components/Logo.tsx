import Link from "next/link";
import Image from "next/image";

// Logotipo de la marca. La página siempre es crema, así que siempre va la versión de letras oscuras.
export default function Logo({ height = 48 }: { height?: number }) {
  return (
    <Link href="/" className="logo" aria-label="Llévelo pues, inicio">
      <Image
        src="/brand/logo.png"
        alt="Llévelo pues"
        width={Math.round((height * 900) / 280)}
        height={height}
        priority
      />
    </Link>
  );
}
