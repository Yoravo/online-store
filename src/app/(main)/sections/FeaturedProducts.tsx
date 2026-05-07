import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  store: { name: string; slug: string };
  images: { url: string; is_primary: boolean }[];
  variants: { price: number }[];
  _count?: { reviews: number };
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

async function getProducts(): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/products?limit=8`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

export default async function FeaturedProducts() {
  const products = await getProducts();

  return (
    <section>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">
            Produk Terbaru
          </h2>
          <p className="text-sm text-ink-light mt-0.5">
            Pilihan terbaik dari seller kami
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm font-medium text-terracotta hover:text-terracotta-dark transition-colors group"
        >
          Lihat Semua
          <ArrowUpRight
            size={16}
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </Link>
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20 text-ink-light text-sm">
          Belum ada produk tersedia.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => {
            const image =
              product.images.find((i) => i.is_primary)?.url ||
              product.images[0]?.url;
            const price = product.variants[0]?.price;
            return (
              <Link key={product.id} href={`/products/${product.slug}`}>
                <div className="group rounded-2xl border-2 border-sand bg-cream overflow-hidden hover:border-ink hover:shadow-brutal transition-all duration-200">
                  {/* Image */}
                  <div className="aspect-square relative bg-cream-dark overflow-hidden">
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
                  {/* Info */}
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
          })}
        </div>
      )}

      {/* Second Section — Trending */}
      <div className="mt-14 mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">
            Seller Terpercaya
          </h2>
          <p className="text-sm text-ink-light mt-0.5">
            Toko dengan rating terbaik
          </p>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="rounded-2xl border-2 border-ink bg-terracotta/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-brutal">
        <div>
          <p className="font-display text-xl font-bold text-ink">
            Buka Toko Sekarang
          </p>
          <p className="text-sm text-ink-light mt-1">
            Gratis, mudah, dan langsung bisa jualan
          </p>
        </div>
        <Link
          href="/open-store"
          className="px-6 py-2.5 bg-terracotta text-white rounded-xl text-sm font-medium border-2 border-ink shadow-brutal hover:bg-terracotta-dark transition-colors whitespace-nowrap"
        >
          Mulai Jualan →
        </Link>
      </div>
    </section>
  );
}
