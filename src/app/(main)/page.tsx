import Link from 'next/link'
import { ShoppingBag, Truck, ShieldCheck } from 'lucide-react'

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-4">
          Belanja Kebutuhan Kamu Jadi <br />
          <span className="text-gray-400">Lebih Mudah</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
          TokoKu adalah marketplace yang menghubungkan pembeli dan penjual di seluruh Indonesia.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/products"
            className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Mulai Belanja
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Buka Toko
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="mb-4 text-gray-900">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-gray-100">
        <div className="bg-gray-950 rounded-3xl px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Siap mulai berjualan?
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Buka toko kamu sekarang dan jangkau ribuan pembeli di seluruh Indonesia.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-white text-black rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Daftar Gratis
          </Link>
        </div>
      </section>
    </>
  )
}

const features = [
  {
    icon: <ShoppingBag size={28} />,
    title: 'Ribuan Produk',
    desc: 'Temukan produk dari berbagai kategori dengan harga terbaik dari seller terpercaya.',
  },
  {
    icon: <Truck size={28} />,
    title: 'Pengiriman Cepat',
    desc: 'Didukung berbagai layanan kurir dengan tracking real-time langsung dari aplikasi.',
  },
  {
    icon: <ShieldCheck size={28} />,
    title: 'Transaksi Aman',
    desc: 'Pembayaran diproses secara aman melalui Midtrans dengan berbagai metode pilihan.',
  },
]