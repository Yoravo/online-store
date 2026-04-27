"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-ink text-cream pt-24 pb-8 relative overflow-hidden">
      {/* Decorative Top Border - Gradient */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-terracotta via-gold to-sage" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">
            Siap Bergabung?
          </h2>
          <p className="text-cream/60 max-w-xl mx-auto mb-8 text-lg">
            Jadilah bagian dari komunitas seller dan pembeli terbesar di
            Indonesia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="/register"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-terracotta text-white rounded-xl font-medium hover:bg-terracotta-dark transition-colors shadow-brutal border-2 border-ink"
            >
              Daftar Gratis
              <ArrowUpRight className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="/open-store"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-cream/10 text-cream rounded-xl font-medium border-2 border-cream/20 hover:bg-cream/20 transition-colors"
            >
              Buka Toko
            </motion.a>
          </div>
        </motion.div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16 pb-16 border-b border-cream/10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-display text-3xl font-bold mb-4">TokoKu</h3>
            <p className="text-cream/60 text-sm leading-relaxed mb-6">
              Marketplace modern yang menghubungkan komunitas kreatif Indonesia
              dengan pembeli yang menghargai kualitas.
            </p>
            <div className="flex gap-4">
              {[FaInstagram, FaTwitter, FaFacebook].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-terracotta transition-colors border border-cream/20"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {[
            {
              title: "Belanja",
              links: ["Semua Produk", "Kategori", "Flash Sale", "Voucher"],
            },
            {
              title: "Seller",
              links: ["Buka Toko", "Panduan", "Biaya", "Sukses Stories"],
            },
            {
              title: "Bantuan",
              links: ["FAQ", "Kontak", "Kebijakan", "Syarat"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-bold mb-4 text-cream/80 font-display">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-cream/50 hover:text-terracotta transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-cream/40">
          <p>© 2024 TokoKu. Crafted with ♥ in Indonesia.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-cream transition-colors">
              Privasi
            </Link>
            <Link href="#" className="hover:text-cream transition-colors">
              Syarat
            </Link>
            <Link href="#" className="hover:text-cream transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
