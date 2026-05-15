"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Store, Package, X } from "lucide-react";

interface ProductSuggestion {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number | null;
  store_name: string;
}

interface StoreSuggestion {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

interface Suggestions {
  products: ProductSuggestion[];
  stores: StoreSuggestion[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

export default function SearchAutocomplete({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestions>({ products: [], stores: [] });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  const totalItems = suggestions.products.length + suggestions.stores.length;
  const hasResults = totalItems > 0;

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions({ products: [], stores: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSuggestions({ products: [], stores: [] });
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query.trim());
      setOpen(true);
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchSuggestions]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const navigateTo = (path: string) => {
    setOpen(false);
    setQuery("");
    router.push(path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || !hasResults) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + totalItems) % totalItems);
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const prodLen = suggestions.products.length;
      if (activeIndex < prodLen) {
        navigateTo(`/products/${suggestions.products[activeIndex].slug}`);
      } else {
        navigateTo(`/stores/${suggestions.stores[activeIndex - prodLen].slug}`);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex w-full">
        <div className="flex w-full rounded-lg overflow-hidden border border-gray-200 hover:border-brand focus-within:border-brand transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            onFocus={() => query.trim().length >= 2 && hasResults && setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Cari produk, toko, atau kategori..."
            className="flex-1 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls="search-suggestions"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setSuggestions({ products: [], stores: [] }); setOpen(false); }}
              aria-label="Hapus pencarian"
              className="px-2 flex items-center text-gray-300 hover:text-gray-500"
            >
              <X size={15} />
            </button>
          )}
          <button
            type="submit"
            aria-label="Cari"
            className="px-4 bg-brand hover:bg-brand-dark transition-colors flex items-center justify-center"
          >
            <Search size={18} className="text-white" />
          </button>
        </div>
      </form>

      {/* Dropdown */}
      {open && (hasResults || loading) && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
        >
          {loading && !hasResults && (
            <div className="px-4 py-3 text-xs text-gray-400">Mencari...</div>
          )}

          {suggestions.products.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1 flex items-center gap-1.5">
                <Package size={12} className="text-gray-300" />
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Produk</span>
              </div>
              {suggestions.products.map((p, i) => (
                <button
                  key={p.id}
                  role="option"
                  aria-selected={activeIndex === i}
                  onClick={() => navigateTo(`/products/${p.slug}`)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    activeIndex === i ? "bg-brand-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                    {p.image ? (
                      <Image src={p.image} alt="" width={36} height={36} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={14} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{p.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{p.store_name}</p>
                  </div>
                  {p.price && (
                    <span className="text-xs font-semibold text-brand shrink-0">
                      {fmt(p.price)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {suggestions.stores.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1 flex items-center gap-1.5 border-t border-gray-100">
                <Store size={12} className="text-gray-300" />
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Toko</span>
              </div>
              {suggestions.stores.map((s, i) => {
                const idx = suggestions.products.length + i;
                return (
                  <button
                    key={s.id}
                    role="option"
                    aria-selected={activeIndex === idx}
                    onClick={() => navigateTo(`/stores/${s.slug}`)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      activeIndex === idx ? "bg-brand-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                      {s.logo ? (
                        <Image src={s.logo} alt="" width={36} height={36} className="object-cover w-full h-full" />
                      ) : (
                        <Store size={14} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{s.name}</p>
                      <p className="text-[11px] text-gray-400">Toko</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer: search all */}
          <button
            onClick={() => { setOpen(false); if (query.trim()) router.push(`/products?q=${encodeURIComponent(query.trim())}`); }}
            className="w-full px-4 py-2.5 text-xs font-medium text-brand hover:bg-brand-50 border-t border-gray-100 transition-colors text-left"
          >
            Cari semua hasil untuk &quot;{query}&quot; →
          </button>
        </div>
      )}
    </div>
  );
}
