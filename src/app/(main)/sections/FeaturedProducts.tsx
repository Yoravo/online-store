import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import prisma from "@/src/lib/db";

interface Product {
  id: string;
  name: string;
  slug: string;
  store: { name: string; slug: string };
  images: { url: string; is_primary: boolean }[];
  variants: { price: number }[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

async function getProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { is_active: true },
      take: 8,
      orderBy: { created_at: "desc" },
      include: {
        store: { select: { name: true, slug: true } },
        images: { where: { is_primary: true }, take: 1 },
        variants: { orderBy: { price: "asc" }, take: 1 },
      },
    });
    return products.map((p) => ({
      ...p,
      variants: p.variants.map((v) => ({ ...v, price: Number(v.price) })),
    })) as unknown as Product[];
  } catch {
    return [];
  }
}

export default async function FeaturedProducts() {
  const products = await getProducts();

  return (
    <section className="space-y-10">
      {/* Produk Terbaru */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Produk Terbaru</h2>
            <p className="text-sm text-gray-400 mt-0.5">Pilihan terbaik dari seller kami</p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark transition-colors group"
          >
            Lihat Semua
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm bg-white rounded-xl border border-gray-100">
            Belum ada produk tersedia.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((product) => {
              const image =
                product.images.find((i) => i.is_primary)?.url ||
                product.images[0]?.url;
              const price = product.variants[0]?.price;

              return (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all duration-200">
                    <div className="aspect-square bg-gray-50 relative overflow-hidden">
                      {image ? (
                        <Image
                          src={image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-[11px] text-gray-400 font-medium truncate">
                        {product.store.name}
                      </p>
                      <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-brand transition-colors">
                        {product.name}
                      </p>
                      {price !== undefined && (
                        <p className="text-sm font-bold text-gray-900 pt-0.5">
                          {fmt(Number(price))}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Promo Banner */}
      <div
        className="rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5"
        style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}
      >
        <div>
          <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">
            Untuk Seller Baru
          </p>
          <h3 className="text-xl font-bold text-white">Buka Toko Sekarang</h3>
          <p className="text-sm text-gray-300 mt-1">
            Gratis, mudah, dan langsung bisa jualan ke seluruh Indonesia
          </p>
        </div>
        <Link
          href="/open-store"
          className="shrink-0 px-6 py-3 bg-white text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors whitespace-nowrap"
        >
          Mulai Jualan →
        </Link>
      </div>
    </section>
  );
}