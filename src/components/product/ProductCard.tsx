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

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

export default function ProductCard({ product }: Props) {
  const image =
    product.images.find((i) => i.is_primary)?.url ||
    product.images[0]?.url ||
    null;
  const price = product.variants[0]?.price;
  const maxPrice =
    product.variants.length > 1
      ? Math.max(...product.variants.map((v) => Number(v.price)))
      : null;
  const minPrice = price ? Number(price) : null;

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all duration-200">
        {/* Image */}
        <div className="aspect-square bg-gray-50 relative overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-200 text-xs">No Image</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 space-y-1">
          <p className="text-[11px] text-gray-400 font-medium truncate">
            {product.store.name}
          </p>
          <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-brand transition-colors">
            {product.name}
          </p>
          {minPrice !== null && (
            <div className="pt-0.5">
              <p className="text-sm font-bold text-gray-900">
                {maxPrice && maxPrice !== minPrice
                  ? `${fmt(minPrice)} — ${fmt(maxPrice)}`
                  : fmt(minPrice)}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
