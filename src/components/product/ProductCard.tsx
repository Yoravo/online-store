import Link from "next/link";
import Image from "next/image";

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    store: { name: string; slug: string };
    images: { url: string }[];
    variants: { price: number }[];
  };
}

export default function ProductCard({ product }: Props) {
  const image = product.images[0]?.url || null;
  const price = product.variants[0]?.price;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="rounded-xl border border-gray-100 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all group">
        <div className="aspect-square bg-gray-50 relative overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
              No Image
            </div>
          )}
        </div>
        <div className="p-3 space-y-1">
          <p className="text-xs text-gray-400 truncate">{product.store.name}</p>
          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
            {product.name}
          </p>
          {price !== undefined && (
            <p className="text-sm font-semibold text-gray-900">
              {formatPrice(Number(price))}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
