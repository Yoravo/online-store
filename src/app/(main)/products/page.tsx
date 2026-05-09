import { Suspense } from "react";
import ProductList from "@/src/components/product/ProductList";
import ProductFilters from "@/src/components/product/ProductFilters";

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Semua Produk</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Temukan produk terbaik dari seller terpercaya
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        {/* Sidebar Filter */}
        <aside className="w-full md:w-52 shrink-0">
          <Suspense>
            <ProductFilters />
          </Suspense>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          <Suspense fallback={<ProductListSkeleton />}>
            <ProductList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function ProductListSkeleton() {
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
