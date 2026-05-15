import Link from "next/link";

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

      {/* Category Chips */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={cat.value ? `/products?category=${cat.value}` : "/products"}
            className="px-4 py-1.5 rounded-full border border-gray-200 bg-white text-sm text-gray-500 font-medium hover:border-brand hover:text-brand transition-colors"
          >
            {cat.label}
          </Link>
        ))}
      </div>
    </section>
  );
}