import { Suspense } from "react";
import ProductList from "@/src/components/product/ProductList";
import ProductFilters from "@/src/components/product/ProductFilters";

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Semua Produk</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Temukan produk terbaik dari seller terpercaya
        </p>
      </div>

      <div className="md:hidden">
        <Suspense>
          <ProductFilters />
        </Suspense>
      </div>

      <div className="flex flex-row gap-5 items-start">
        <aside className="hidden md:block w-52 shrink-0 sticky top-20">
          <Suspense>
            <ProductFilters />
          </Suspense>
        </aside>

        <div className="flex-1 min-w-0 w-0">
          <Suspense>
            <ProductList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
