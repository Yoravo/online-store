import { Suspense } from "react";
import ProductList from "@/src/components/product/ProductList";
import ProductFilters from '@/src/components/product/ProductFilters'

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Semua Produk</h1>
        <p className="text-sm text-gray-500 mt-1">Temukan produk terbaik dari seller terpercaya</p>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-56 shrink-0">
          <Suspense>
            <ProductFilters />
          </Suspense>
        </aside>
        <div className="flex-1">
          <Suspense fallback={<ProductListSkeleton />}>
            <ProductList />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-100" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}