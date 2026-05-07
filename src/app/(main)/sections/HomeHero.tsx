"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

const CATEGORIES = [
  { label: "Semua", value: "" },
  { label: "Fashion", value: "fashion" },
  { label: "Elektronik", value: "elektronik" },
  { label: "Makanan", value: "makanan" },
  { label: "Kecantikan", value: "kecantikan" },
  { label: "Rumah", value: "rumah" },
  { label: "Olahraga", value: "olahraga" },
];

export default function HomeHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="py-10 mb-2">
      {/* Headline */}
      <div className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink leading-tight">
          Temukan apa yang kamu butuhkan
        </h1>
        <p className="text-ink-light mt-1.5 text-sm">
          Ribuan produk dari seller terpercaya se-Indonesia
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6 max-w-2xl">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari produk, toko, atau kategori..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-sand bg-cream-dark text-sm text-ink placeholder:text-ink-light/60 focus:outline-none focus:border-terracotta transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-3 bg-terracotta text-white rounded-xl text-sm font-medium hover:bg-terracotta-dark transition-colors border-2 border-ink shadow-brutal"
        >
          Cari
        </button>
      </form>

      {/* Category Chips */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() =>
              router.push(
                cat.value ? `/products?category=${cat.value}` : "/products",
              )
            }
            className="px-4 py-1.5 rounded-full border-2 border-sand bg-cream-dark text-sm text-ink-light font-medium hover:border-terracotta hover:text-terracotta transition-colors"
          >
            {cat.label}
          </button>
        ))}
      </div>
    </section>
  );
}
