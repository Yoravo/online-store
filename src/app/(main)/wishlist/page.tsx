"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    store: { name: string; slug: string };
    images: { url: string }[];
    variants: { price: number }[];
  };
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export default function WishlistPage() {
  const [wishlists, setWishlists] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data) => setWishlists(data.wishlists || []))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId: string) => {
    setRemoving(productId);
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      setWishlists((prev) => prev.filter((w) => w.product.id !== productId));
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Wishlist</h1>
        <p className="text-sm text-ink-light mt-0.5">Produk yang kamu simpan</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border-2 border-sand animate-pulse"
            >
              <div className="aspect-square bg-cream-dark rounded-t-xl" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-cream-dark rounded w-2/3" />
                <div className="h-3 bg-cream-dark rounded w-full" />
                <div className="h-4 bg-cream-dark rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : wishlists.length === 0 ? (
        <div className="text-center py-24 bg-cream-dark rounded-2xl border-2 border-sand">
          <Heart size={48} className="mx-auto text-sand mb-4" />
          <h2 className="font-display text-xl font-bold text-ink mb-2">
            Wishlist masih kosong
          </h2>
          <p className="text-sm text-ink-light mb-6">
            Simpan produk favoritmu agar mudah ditemukan kembali
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-terracotta text-white rounded-xl text-sm font-medium border-2 border-ink shadow-brutal hover:bg-terracotta-dark transition-colors"
          >
            <ShoppingBag size={16} />
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-ink-light">
            {wishlists.length} produk tersimpan
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlists.map(({ id, product }) => {
              const image = product.images[0]?.url;
              const price = product.variants[0]?.price;
              return (
                <div
                  key={id}
                  className="group relative rounded-2xl border-2 border-sand bg-cream overflow-hidden hover:border-ink hover:shadow-brutal transition-all duration-200"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(product.id)}
                    disabled={removing === product.id}
                    className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full border-2 border-sand flex items-center justify-center hover:border-red-400 hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    {removing === product.id ? (
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                  </button>

                  <Link href={`/products/${product.slug}`}>
                    {/* Image */}
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
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
