import Link from "next/link";

const CATEGORIES = [
  { label: "Fashion", slug: "fashion", emoji: "👕" },
  { label: "Elektronik", slug: "elektronik", emoji: "📱" },
  { label: "Makanan", slug: "makanan", emoji: "🍜" },
  { label: "Kecantikan", slug: "kecantikan", emoji: "💄" },
  { label: "Rumah", slug: "rumah", emoji: "🏠" },
  { label: "Olahraga", slug: "olahraga", emoji: "⚽" },
  { label: "Buku", slug: "buku", emoji: "📚" },
  { label: "Otomotif", slug: "otomotif", emoji: "🚗" },
];

export default function Categories() {
  return (
    <section className="mb-10">
      <h2 className="font-display text-xl font-bold text-ink mb-4">Kategori</h2>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/products?category=${cat.slug}`}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-sand bg-cream-dark hover:border-terracotta hover:bg-terracotta/5 transition-all group"
          >
            <span className="text-2xl">{cat.emoji}</span>
            <span className="text-xs font-medium text-ink-light group-hover:text-terracotta transition-colors text-center leading-tight">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
