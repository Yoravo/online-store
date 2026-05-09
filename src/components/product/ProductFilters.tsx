"use client";

import { useEffect, useReducer } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/src/components/product/ProductCard";
import { PackageSearch, ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  store: { name: string; slug: string };
  category: { name: string; slug: string };
  images: { url: string; is_primary?: boolean }[];
  variants: { price: number }[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type State = {
  products: Product[];
  pagination: Pagination | null;
  loading: boolean;
};

export default function ProductList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [state, dispatch] = useReducer(
    (s: State, action: Partial<State>) => ({
      ...s,
      ...action,
    }),
    {
      products: [],
      pagination: null,
      loading: true,
    },
  );

  const page = searchParams.get("page") || "1";
  const category = searchParams.get("category") || "";
  const searchQuery = searchParams.get("search") || searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "";

  useEffect(() => {
    let cancelled = false;

    dispatch({ loading: true });

    const params = new URLSearchParams();

    if (page) params.set("page", page);
    if (category) params.set("category", category);
    if (searchQuery) params.set("search", searchQuery);
    if (sort) params.set("sort", sort);

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;

        dispatch({
          products: d.products || [],
          pagination: d.pagination || null,
          loading: false,
        });
      })
      .catch(() => {
        if (!cancelled) {
          dispatch({
            loading: false,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, category, searchQuery, sort]);

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", p.toString());

    router.push(`/products?${params.toString()}`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (state.loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse"
          >
            <div className="aspect-square bg-gray-100" />

            <div className="p-3 space-y-2">
              <div className="h-2.5 bg-gray-100 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
              <div className="h-3.5 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (state.products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
          <PackageSearch size={28} className="text-gray-200" />
        </div>

        <p className="text-base font-semibold text-gray-900">
          Produk tidak ditemukan
        </p>

        <p className="text-sm text-gray-400 mt-1">
          {searchQuery
            ? `Tidak ada hasil untuk "${searchQuery}"`
            : "Coba filter atau kategori lain"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Result count */}
      {state.pagination && (
        <p className="text-sm text-gray-400">
          Menampilkan{" "}
          <span className="font-semibold text-gray-700">
            {state.pagination.total}
          </span>{" "}
          produk
          {searchQuery && ` untuk "${searchQuery}"`}
          {category && ` di kategori ini`}
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {state.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {state.pagination && state.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage(state.pagination!.page - 1)}
            disabled={state.pagination.page === 1}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={15} />
            Prev
          </button>

          <div className="flex items-center gap-1">
            {Array.from(
              { length: state.pagination.totalPages },
              (_, i) => i + 1,
            )
              .filter(
                (p) =>
                  p === 1 ||
                  p === state.pagination!.totalPages ||
                  Math.abs(p - state.pagination!.page) <= 1,
              )
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) {
                  acc.push("...");
                }

                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span
                    key={`dots-${i}`}
                    className="px-1 text-gray-300 text-sm"
                  >
                    ···
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      state.pagination!.page === p
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
          </div>

          <button
            onClick={() => setPage(state.pagination!.page + 1)}
            disabled={state.pagination.page === state.pagination.totalPages}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
