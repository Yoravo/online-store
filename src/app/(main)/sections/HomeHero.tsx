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
    <section className="py-8 mb-2">
      <div className="mb-5">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
          Temukan apa yang <br className="hidden sm:block" />
          kamu butuhkan
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Ribuan produk dari seller terpercaya se-Indonesia
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-5 max-w-2xl">
        <div className="flex-1 flex rounded-xl overflow-hidden border border-gray-200 hover:border-brand focus-within:border-brand transition-colors bg-white">
          <div className="flex items-center pl-4">
            <Search size={17} className="text-gray-400 shrink-0" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari produk, toko, atau kategori..."
            className="flex-1 px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl text-sm font-semibold transition-colors shrink-0"
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
              router.push(cat.value ? `/products?category=${cat.value}` : "/products")
            }
            className="px-4 py-1.5 rounded-full border border-gray-200 bg-white text-sm text-gray-500 font-medium hover:border-brand hover:text-brand transition-colors"
          >
            {cat.label}
          </button>
        ))}
      </div>
    </section>
  );
}