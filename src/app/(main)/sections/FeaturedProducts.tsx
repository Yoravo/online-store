"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star, ArrowUpRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  storeName: string;
  rating: number;
  sold: number;
  tag?: string;
}

const featuredProducts: Product[] = [
  {
    id: "1",
    name: "Tote Bag Kanvas Lokal",
    price: 85000,
    originalPrice: 120000,
    image: "/placeholder-product.jpg",
    storeName: "Crafted.id",
    rating: 4.9,
    sold: 2340,
    tag: "Best Seller",
  },
  {
    id: "2",
    name: "Kopi Arabika Aceh Gayo",
    price: 125000,
    image: "/placeholder-product.jpg",
    storeName: "Kopi Nusantara",
    rating: 4.9,
    sold: 1890,
    tag: "Baru",
  },
  {
    id: "3",
    name: "Handmade Ceramic Mug",
    price: 95000,
    image: "/placeholder-product.jpg",
    storeName: "Terra Studio",
    rating: 4.8,
    sold: 567,
  },
  {
    id: "4",
    name: "Sneakers Lokal Premium",
    price: 450000,
    originalPrice: 599000,
    image: "/placeholder-product.jpg",
    storeName: "Stride ID",
    rating: 4.9,
    sold: 3200,
    tag: "Diskon",
  },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function FeaturedProducts() {
  return (
    <section className="py-32 bg-cream-dark relative overflow-hidden">
      {/* Background Text - Editorial touch */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 whitespace-nowrap pointer-events-none opacity-[0.03]">
        <span className="font-display text-[200px] font-bold tracking-tighter">
          PRODUK PILIHAN • PRODUK PILIHAN •
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-sm font-medium mb-4 border border-terracotta/20">
              Rekomendasi
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold max-w-lg text-ink">
              Produk Populer Bulan Ini
            </h2>
          </div>
          <Link href="/products">
            <motion.span
              whileHover={{ x: 5 }}
              className="inline-flex items-center gap-2 text-ink font-medium hover:text-terracotta transition-colors cursor-pointer group"
            >
              Lihat Semua Produk
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </motion.span>
          </Link>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {featuredProducts.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <Link href={`/products/${product.id}`}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="group bg-cream rounded-2xl border-2 border-ink overflow-hidden shadow-brutal hover:shadow-brutal-hover transition-all duration-300"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-sand/50">
                    {/* Tag */}
                    {product.tag && (
                      <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-terracotta text-white text-xs font-bold rounded-full border border-ink shadow-brutal">
                        {product.tag}
                      </div>
                    )}
                    {/* Discount Badge */}
                    {product.originalPrice && (
                      <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-ink text-white text-xs font-bold rounded-full border border-ink shadow-brutal">
                        {Math.round(
                          (1 - product.price / product.originalPrice) * 100
                        )}
                        % OFF
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display text-2xl text-ink/20 rotate-[-5deg]">
                        Product Image
                      </span>
                    </div>
                    {/* Hover Overlay with Quick Add */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-ink/10 flex items-center justify-center"
                    >
                      <motion.button whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-white text-ink rounded-full font-medium shadow-brutal border-2 border-ink flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Tambah</span>
                      </motion.button>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <p className="text-xs text-sage font-medium uppercase tracking-wide mb-1">
                      {product.storeName}
                    </p>
                    <h3 className="font-display text-lg font-semibold text-ink mb-3 line-clamp-2 group-hover:text-terracotta transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star
                          className="w-4 h-4 fill-gold text-gold"
                          strokeWidth={0}
                        />
                        <span className="text-sm font-medium text-ink">
                          {product.rating}
                        </span>
                      </div>
                      <span className="text-sand">•</span>
                      <span className="text-sm text-ink-light">
                        {product.sold} terjual
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xl font-bold text-terracotta">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-ink-light line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
