'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Sparkles } from 'lucide-react'

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background blobs */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 rounded-full bg-sage/20 blur-3xl pointer-events-none"
        style={{ y }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-terracotta/10 blur-3xl pointer-events-none"
        style={{ y }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--ink)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--ink)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left content */}
          <motion.div
            className="order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream-dark border-2 border-ink mb-8 shadow-brutal"
            >
              <Sparkles className="w-4 h-4 text-terracotta" />
              <span className="text-sm font-medium tracking-wide uppercase">
                Marketplace Lokal Indonesia
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-ink"
            >
              Belanja{' '}
              <span className="relative inline-block">
                Kebutuhan
                <motion.svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-terracotta"
                  viewBox="0 0 300 12"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                >
                  <motion.path
                    d="M2 10C50 2 250 2 298 10"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />
                </motion.svg>
              </span>
              <br />
              Jadi Lebih Mudah
            </motion.h1>

            {/* Subhead */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-ink-light leading-relaxed mb-10 max-w-md"
            >
              Temukan produk berkualitas dari ribuan seller terpercaya di
              seluruh Indonesia. Pengalaman belanja yang aman, nyaman, dan
              penuh kejutan.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/products">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '8px 8px 0px 0px hsl(30 6% 10%)' }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-terracotta text-white rounded-xl font-medium shadow-brutal border-2 border-ink hover:bg-terracotta-dark transition-colors"
                >
                  Mulai Belanja
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </motion.button>
              </Link>
              <Link href="/open-store">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '6px 6px 0px 0px hsl(30 6% 10%)' }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-cream-dark text-ink rounded-xl font-medium border-2 border-ink shadow-brutal hover:bg-sand transition-colors"
                >
                  Buka Toko Kamu
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex gap-12 mt-16 pt-8 border-t-2 border-sand"
            >
              {[
                { number: '10K+', label: 'Produk' },
                { number: '2K+', label: 'Seller' },
                { number: '50K+', label: 'Pelanggan' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                >
                  <div className="font-display text-3xl font-bold text-terracotta">
                    {stat.number}
                  </div>
                  <div className="text-sm text-ink-light mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right content */}
          <motion.div
            className="order-1 lg:order-2 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="relative">
              {/* Main Image Container */}
              <motion.div
                className="relative aspect-square rounded-3xl overflow-hidden border-2 border-ink shadow-brutal bg-cream-dark"
                whileHover={{ boxShadow: '12px 12px 0px 0px hsl(15 58% 50%)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-linear-to-br from-sage/30 to-terracotta/20 flex items-center justify-center">
                  <span className="font-display text-6xl text-ink/20 rotate-[-5deg]">
                    Galeri Produk
                  </span>
                </div>

                {/* Floating Badge */}
                <motion.div
                  className="absolute top-6 right-6 px-4 py-2 bg-white rounded-full border-2 border-ink shadow-brutal flex items-center gap-2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">Live Shopping</span>
                </motion.div>
              </motion.div>

              {/* Decorative Elements */}
              <motion.div
                className="absolute -bottom-6 -left-6 w-32 h-32 bg-gold rounded-2xl border-2 border-ink -z-10"
                animate={{ rotate: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute -top-4 -right-4 w-24 h-24 bg-sage/40 rounded-full border-2 border-ink -z-10"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest text-ink-light">Scroll</span>
        <motion.div
          className="w-6 h-10 border-2 border-ink rounded-full flex justify-center pt-2"
          initial={{ opacity: 0.5 }}
        >
          <motion.div
            className="w-1.5 h-3 bg-terracotta rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}