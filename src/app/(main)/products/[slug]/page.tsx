"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product);
        setAvgRating(data.avgRating);
        setSelectedVariant(data.product?.variants[0] || null);
        const primary = data.product?.images.find(
          (i: { is_primary: boolean }) => i.is_primary,
        );
        setSelectedImage(primary?.url || data.product?.images[0]?.url || null);
        if (data.product) {
          fetch(`/api/wishlist/${data.product.id}`)
            .then((r) => r.json())
            .then((d) => setWishlisted(d.wishlisted));
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

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
    if (!product) return;
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

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-5xl">
        <div className="h-4 w-24 bg-cream-dark rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-cream-dark rounded-2xl" />
          <div className="space-y-4">
            <div className="h-3 bg-cream-dark rounded w-1/4" />
            <div className="h-6 bg-cream-dark rounded w-3/4" />
            <div className="h-4 bg-cream-dark rounded w-1/3" />
            <div className="h-8 bg-cream-dark rounded w-1/2" />
            <div className="h-12 bg-cream-dark rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <p className="text-ink-light mb-3">Produk tidak ditemukan</p>
        <Link
          href="/products"
          className="text-sm text-terracotta hover:underline"
        >
          ← Kembali ke produk
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Back */}
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-ink-light hover:text-ink transition-colors"
      >
        <ChevronLeft size={16} />
        Kembali ke produk
      </Link>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* === IMAGES === */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden border-2 border-sand bg-cream-dark relative">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sand text-sm">
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
                      ? "border-ink"
                      : "border-sand hover:border-ink-light"
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

        {/* === INFO === */}
        <div className="space-y-5">
          {/* Category + Name */}
          <div>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-xs text-sage font-medium uppercase tracking-wide hover:text-terracotta transition-colors"
            >
              {product.category.name}
            </Link>
            <h1 className="font-display text-2xl font-bold text-ink mt-1 leading-snug">
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          {product.reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.round(avgRating)
                        ? "fill-gold text-gold"
                        : "text-sand fill-sand"
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-ink-light">
                {avgRating.toFixed(1)} <span className="text-sand">·</span>{" "}
                {product.reviews.length} ulasan
              </span>
            </div>
          )}

          {/* Price */}
          {selectedVariant && (
            <div>
              <p className="font-display text-3xl font-bold text-terracotta">
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

          {/* Variants */}
          {product.variants.length > 1 && (
            <div>
              <p className="text-sm font-medium text-ink mb-2">Varian</p>
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
                        ? "border-ink bg-ink text-cream"
                        : "border-sand hover:border-ink-light text-ink"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-sm font-medium text-ink mb-2">Jumlah</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-xl border-2 border-sand hover:border-ink flex items-center justify-center text-ink transition-colors font-medium"
              >
                −
              </button>
              <span className="text-sm font-semibold text-ink w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity((q) =>
                    Math.min(selectedVariant?.stock || 1, q + 1),
                  )
                }
                className="w-9 h-9 rounded-xl border-2 border-sand hover:border-ink flex items-center justify-center text-ink transition-colors font-medium"
              >
                +
              </button>
              {selectedVariant && (
                <span className="text-xs text-ink-light">
                  Stok: {selectedVariant.stock}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-1">
            {cartMessage && (
              <p
                className={`text-sm px-4 py-2.5 rounded-xl border-2 ${
                  cartMessage.includes("berhasil")
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-500"
                }`}
              >
                {cartMessage}
              </p>
            )}
            <div className="flex gap-2">
              {/* Wishlist */}
              <button
                onClick={handleWishlist}
                disabled={wishlistLoading}
                className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${
                  wishlisted
                    ? "border-terracotta bg-terracotta/10 text-terracotta"
                    : "border-sand hover:border-terracotta hover:text-terracotta text-ink-light"
                }`}
              >
                {wishlistLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart
                    size={17}
                    className={wishlisted ? "fill-terracotta" : ""}
                  />
                )}
              </button>
              {/* Keranjang */}
              <button
                onClick={handleAddToCart}
                disabled={
                  !selectedVariant ||
                  selectedVariant.stock === 0 ||
                  addingToCart
                }
                className="flex-1 py-2.5 rounded-xl border-2 border-ink text-ink text-sm font-medium hover:bg-cream-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {addingToCart ? "Menambahkan..." : "+ Keranjang"}
              </button>
              {/* Beli */}
              <button
                disabled={!selectedVariant || selectedVariant.stock === 0}
                className="flex-1 py-2.5 rounded-xl bg-terracotta text-white text-sm font-medium border-2 border-ink shadow-brutal hover:bg-terracotta-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Beli Sekarang
              </button>
            </div>
          </div>

          {/* Store Card */}
          <Link
            href={`/stores/${product.store.slug}`}
            className="flex items-center gap-3 p-4 rounded-2xl border-2 border-sand hover:border-ink hover:shadow-brutal transition-all"
          >
            <div className="w-10 h-10 rounded-xl border-2 border-sand bg-cream-dark flex items-center justify-center overflow-hidden shrink-0">
              {product.store.logo ? (
                <Image
                  src={product.store.logo}
                  alt={product.store.name}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Store size={18} className="text-sand" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink">
                {product.store.name}
              </p>
              <p className="text-xs text-ink-light">Lihat toko →</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="border-t-2 border-sand pt-8">
          <h2 className="font-display text-lg font-bold text-ink mb-4">
            Deskripsi Produk
          </h2>
          <p className="text-sm text-ink-light leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}

      {/* Reviews */}
      <div className="border-t-2 border-sand pt-8">
        <h2 className="font-display text-lg font-bold text-ink mb-6">
          Ulasan ({product.reviews.length})
        </h2>
        {product.reviews.length === 0 ? (
          <div className="py-10 text-center bg-cream-dark rounded-2xl border-2 border-sand">
            <Star size={32} className="mx-auto text-sand mb-3" />
            <p className="text-sm text-ink-light">
              Belum ada ulasan untuk produk ini.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 rounded-2xl border-2 border-sand bg-cream space-y-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-terracotta/20 border-2 border-sand flex items-center justify-center text-xs font-bold text-terracotta shrink-0">
                    {review.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {review.user.name}
                    </p>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          className={
                            i < review.rating
                              ? "fill-gold text-gold"
                              : "text-sand fill-sand"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-xs text-ink-light">
                    {new Date(review.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-ink-light leading-relaxed pl-11">
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
