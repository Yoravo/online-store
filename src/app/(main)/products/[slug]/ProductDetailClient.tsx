"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Store, Star, ChevronLeft, Heart } from "lucide-react";

interface Variant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  user: { name: string; avatar: string | null };
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  images: { id: string; url: string; is_primary: boolean }[];
  variants: Variant[];
  store: { id: string; name: string; slug: string; logo: string | null };
  category: { name: string; slug: string };
  reviews: Review[];
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export default function ProductDetailClient({
  product,
  avgRating,
}: {
  product: Product;
  avgRating: number;
}) {
  const [selectedVariant, setSelectedVariant] = useState<Variant>(
    product.variants[0],
  );
  const [selectedImage, setSelectedImage] = useState<string>(
    product.images.find((i) => i.is_primary)?.url ||
      product.images[0]?.url ||
      "",
  );
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/wishlist/${product.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setWishlisted(d.wishlisted))
      .catch(() => {});
  }, [product.id]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setAddingToCart(true);
    setCartMessage("");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: selectedVariant.id, quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCartMessage(data.message);
        return;
      }
      window.dispatchEvent(new Event("cart:updated"));
      setCartMessage("Produk berhasil ditambahkan ke keranjang!");
    } catch {
      setCartMessage("Terjadi kesalahan, coba lagi");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    setWishlistLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      setWishlisted(data.wishlisted);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl">
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft size={16} />
        Kembali ke produk
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 relative">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                No Image
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    selectedImage === img.url
                      ? "border-gray-900"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={product.name}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-xs text-gray-400 font-medium uppercase tracking-wide hover:text-brand transition-colors"
            >
              {product.category.name}
            </Link>
            <h1 className="font-display text-2xl font-bold text-gray-900 mt-1 leading-snug">
              {product.name}
            </h1>
          </div>

          {product.reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.round(avgRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200 fill-gray-200"
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {avgRating.toFixed(1)} · {product.reviews.length} ulasan
              </span>
            </div>
          )}

          {selectedVariant && (
            <div>
              <p className="font-display text-3xl font-bold text-brand">
                {formatPrice(Number(selectedVariant.price))}
              </p>
              {selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
                <p className="text-xs text-amber-500 mt-1">
                  Sisa {selectedVariant.stock} lagi!
                </p>
              )}
              {selectedVariant.stock === 0 && (
                <p className="text-xs text-red-400 mt-1">Stok habis</p>
              )}
            </div>
          )}

          {product.variants.length > 1 && (
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Varian</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariant(v);
                      setQuantity(1);
                    }}
                    disabled={v.stock === 0}
                    className={`px-4 py-2 text-sm rounded-xl border-2 font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      selectedVariant?.id === v.id
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 hover:border-gray-400 text-gray-900"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">Jumlah</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Kurangi jumlah"
                className="w-9 h-9 rounded-xl border-2 border-gray-200 hover:border-gray-400 flex items-center justify-center text-gray-900 transition-colors font-medium"
              >
                −
              </button>
              <span className="text-sm font-semibold text-gray-900 w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity((q) =>
                    Math.min(selectedVariant?.stock || 1, q + 1),
                  )
                }
                aria-label="Tambah jumlah"
                className="w-9 h-9 rounded-xl border-2 border-gray-200 hover:border-gray-400 flex items-center justify-center text-gray-900 transition-colors font-medium"
              >
                +
              </button>
              {selectedVariant && (
                <span className="text-xs text-gray-400">
                  Stok: {selectedVariant.stock}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {cartMessage && (
              <p
                className={`text-sm px-4 py-2.5 rounded-xl border ${
                  cartMessage.includes("berhasil")
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-500"
                }`}
              >
                {cartMessage}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleWishlist}
                disabled={wishlistLoading}
                aria-label={wishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"}
                className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${
                  wishlisted
                    ? "border-brand bg-brand-50 text-brand"
                    : "border-gray-200 hover:border-brand hover:text-brand text-gray-400"
                }`}
              >
                {wishlistLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart
                    size={17}
                    className={wishlisted ? "fill-brand" : ""}
                  />
                )}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={
                  !selectedVariant ||
                  selectedVariant.stock === 0 ||
                  addingToCart
                }
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-900 text-gray-900 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {addingToCart ? "Menambahkan..." : "+ Keranjang"}
              </button>
              <button
                disabled={!selectedVariant || selectedVariant.stock === 0}
                className="flex-1 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Beli Sekarang
              </button>
            </div>
          </div>

          <Link
            href={`/stores/${product.store.slug}`}
            className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
              {product.store.logo ? (
                <Image
                  src={product.store.logo}
                  alt={product.store.name}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Store size={18} className="text-gray-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {product.store.name}
              </p>
              <p className="text-xs text-gray-400">Lihat toko →</p>
            </div>
          </Link>
        </div>
      </div>

      {product.description && (
        <div className="border-t border-gray-200 pt-8">
          <h2 className="font-display text-lg font-bold text-gray-900 mb-4">
            Deskripsi Produk
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}

      <div className="border-t border-gray-200 pt-8">
        <h2 className="font-display text-lg font-bold text-gray-900 mb-6">
          Ulasan ({product.reviews.length})
        </h2>
        {product.reviews.length === 0 ? (
          <div className="py-10 text-center bg-gray-50 rounded-2xl border border-gray-200">
            <Star size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">
              Belum ada ulasan untuk produk ini.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand/10 border border-gray-200 flex items-center justify-center text-xs font-bold text-brand shrink-0">
                    {review.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {review.user.name}
                    </p>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          className={
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200 fill-gray-200"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-500 leading-relaxed pl-11">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
