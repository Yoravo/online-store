import { Users, Store, Package, ShoppingBag } from 'lucide-react'
import prisma from '@/src/lib/db'

async function getStats() {
  const [users, stores, products, orders] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.product.count(),
    prisma.order.count(),
  ])
  return { users, stores, products, orders }
}

export default async function AdminPage() {
  const stats = await getStats()

  const cards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Toko', value: stats.stores, icon: Store, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Produk', value: stats.products, icon: Package, color: 'bg-amber-50 text-amber-600' },
    { label: 'Total Order', value: stats.orders, icon: ShoppingBag, color: 'bg-green-50 text-green-600' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Ringkasan platform TokoKu</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString('id-ID')}</p>
            <p className="text-sm text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}