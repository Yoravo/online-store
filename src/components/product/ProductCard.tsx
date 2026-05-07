import Link from "next/link";
import Image from "next/image";

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    store: { name: string; slug: string };
    images: { url: string; is_primary?: boolean }[];
    variants: { price: number }[];
  };
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export default function ProductCard({ product }: Props) {
  const image =
    product.images.find((i) => i.is_primary)?.url ||
    product.images[0]?.url ||
    null;
  const price = product.variants[0]?.price;

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group rounded-2xl border-2 border-sand bg-cream overflow-hidden hover:border-ink hover:shadow-brutal transition-all duration-200">
        <div className="aspect-square bg-cream-dark relative overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sand text-xs">
              No Image
            </div>
          )}
        </div>
        <div className="p-3 space-y-1">
          <p className="text-[11px] text-sage font-medium uppercase tracking-wide truncate">
            {product.store.name}
          </p>
          <p className="text-sm font-semibold text-ink line-clamp-2 leading-snug group-hover:text-terracotta transition-colors">
            {product.name}
          </p>
          {price !== undefined && (
            <p className="text-sm font-bold text-terracotta">
              {formatPrice(Number(price))}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
