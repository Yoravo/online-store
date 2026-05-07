"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Store, Package, ChevronLeft, Search } from "lucide-react";
import ProductCard from "@/src/components/product/ProductCard";

interface StoreData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  created_at: string;
  _count: { products: number; orders: number };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  store: { name: string; slug: string };
  images: { url: string; is_primary: boolean }[];
  variants: { price: number }[];
}

interface Pagination {
  total: number;
  page: number;
  totalPages: number;
}

export default function StoreDetailPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchStore() {
      setLoading(true);

      try {
        const params = new URLSearchParams({ page: String(page) });

        if (search) {
          params.set("search", search);
        }

        const res = await fetch(`/api/stores/${slug}?${params}`);

        if (res.status === 404) {
          if (!ignore) setNotFound(true);
          return;
        }

        const data = await res.json();

        if (!ignore) {
          setStore(data.store);
          setProducts(data.products);
          setPagination(data.pagination);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchStore();

    return () => {
      ignore = true;
    };
  }, [slug, page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const joinedYear = store ? new Date(store.created_at).getFullYear() : null;

  if (notFound) {
    return (
      <div className="text-center py-20">
        <Store size={48} className="mx-auto text-sand mb-4" />
        <h1 className="font-display text-2xl font-bold text-ink mb-2">
          Toko tidak ditemukan
        </h1>
        <p className="text-ink-light text-sm mb-6">
          Toko ini mungkin sudah tidak aktif.
        </p>
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
    <div className="space-y-8">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-ink-light hover:text-ink transition-colors"
      >
        <ChevronLeft size={16} />
        Kembali
      </button>

      {/* Store Header */}
      {loading && !store ? (
        <div className="rounded-2xl border-2 border-sand bg-cream-dark animate-pulse h-40" />
      ) : (
        store && (
          <div className="rounded-2xl border-2 border-sand bg-cream-dark p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl border-2 border-sand bg-cream overflow-hidden flex items-center justify-center shrink-0">
              {store.logo ? (
                <Image
                  src={store.logo}
                  alt={store.name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Store size={32} className="text-sand" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl font-bold text-ink">
                {store.name}
              </h1>
              {store.description && (
                <p className="text-sm text-ink-light mt-1 line-clamp-2">
                  {store.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-sm text-ink-light">
                  <Package size={14} className="text-terracotta" />
                  <span>{store._count.products} produk</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-ink-light">
                  <span className="text-terracotta">✦</span>
                  <span>Bergabung {joinedYear}</span>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light pointer-events-none"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari produk di toko ini..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-sand bg-cream text-sm text-ink placeholder:text-ink-light/60 focus:outline-none focus:border-terracotta transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-terracotta text-white rounded-xl text-sm font-medium border-2 border-ink shadow-brutal hover:bg-terracotta-dark transition-colors"
        >
          Cari
        </button>
      </form>

      {/* Products */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
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
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Package size={40} className="mx-auto text-sand mb-3" />
          <p className="text-ink-light text-sm">
            {search
              ? `Tidak ada produk untuk "${search}"`
              : "Belum ada produk di toko ini"}
          </p>
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setPage(1);
              }}
              className="text-sm text-terracotta hover:underline mt-2"
            >
              Hapus pencarian
            </button>
          )}
        </div>
      ) : (
        <>
          <div>
            <p className="text-sm text-ink-light mb-4">
              {pagination?.total} produk{search ? ` untuk "${search}"` : ""}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    store: { name: store?.name || "", slug: store?.slug || "" },
                  }}
                />
              ))}
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border-2 border-sand text-sm font-medium text-ink-light hover:border-ink hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <span className="text-sm text-ink-light px-2">
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page === pagination.totalPages}
                className="px-4 py-2 rounded-xl border-2 border-sand text-sm font-medium text-ink-light hover:border-ink hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
