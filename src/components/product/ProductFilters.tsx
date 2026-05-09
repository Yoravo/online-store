"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const SORT_OPTIONS = [
  { label: "Terbaru", value: "newest" },
  { label: "Termurah", value: "price_asc" },
  { label: "Termahal", value: "price_desc" },
];

interface FilterContentProps {
  categories: Category[];
  activeCategory: string;
  activeSort: string;
  onFilter: (key: string, value: string) => void;
  onClear: () => void;
}

function FilterContent({ categories, activeCategory, activeSort, onFilter, onClear }: FilterContentProps) {
  const hasFilters = activeCategory || activeSort;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-900">Filter</span>
        </div>
        {hasFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-brand hover:text-brand-dark font-medium transition-colors"
          >
            <X size={11} /> Reset
          </button>
        )}
      </div>

      {/* Sort */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Urutkan</p>
        <div className="space-y-0.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilter("sort", activeSort === opt.value ? "" : opt.value)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                activeSort === opt.value
                  ? "bg-brand text-white font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Kategori */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Kategori</p>
        <div className="space-y-0.5">
          <button
            onClick={() => onFilter("category", "")}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
              !activeCategory
                ? "bg-brand text-white font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Semua Kategori
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onFilter("category", cat.slug)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                activeCategory === cat.slug
                  ? "bg-brand text-white font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat.name}
              {activeCategory === cat.slug && <X size={12} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);

  const activeCategory = searchParams.get("category") || "";
  const activeSort = searchParams.get("sort") || "";
  const hasFilters = activeCategory || activeSort;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setCategories(d.categories || []); });
    return () => { cancelled = true; };
  }, []);

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const clearAll = () => router.push("/products");

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-gray-400" />
          Filter & Urutkan
        </span>
        {hasFilters && (
          <span className="bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {[activeCategory, activeSort].filter(Boolean).length}
          </span>
        )}
      </button>

      {/* Mobile Bottom Sheet */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto md:hidden">
            <div className="flex justify-center mb-4">
              <div className="w-8 h-1 bg-gray-200 rounded-full" />
            </div>
            <FilterContent
              categories={categories}
              activeCategory={activeCategory}
              activeSort={activeSort}
              onFilter={setFilter}
              onClear={clearAll}
            />
            <button
              onClick={() => setOpen(false)}
              className="mt-5 w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold"
            >
              Terapkan Filter
            </button>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 p-4">
        <FilterContent
          categories={categories}
          activeCategory={activeCategory}
          activeSort={activeSort}
          onFilter={setFilter}
          onClear={clearAll}
        />
      </div>
    </>
  );
}