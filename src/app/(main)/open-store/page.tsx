'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store, ArrowRight } from 'lucide-react'

export default function OpenStorePage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', slug: '', description: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
      // Auto generate slug dari nama
      ...(name === 'name' && {
        slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      })
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message)
        return
      }

      setSuccess(true)
    } catch {
      setError('Terjadi kesalahan, coba lagi')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Store size={28} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Pengajuan Terkirim!</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Pengajuan toko kamu sedang ditinjau oleh admin. Kamu akan mendapat notifikasi setelah disetujui.
          Proses biasanya memakan waktu 1x24 jam.
        </p>
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Kembali ke Beranda
          <ArrowRight size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Buka Toko</h1>
        <p className="text-sm text-gray-500 mt-1">
          Isi informasi toko kamu. Pengajuan akan ditinjau oleh admin sebelum disetujui.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Toko
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Contoh: Toko Baju Keren"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug Toko
          </label>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-black">
            <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200">
              tokoku.com/stores/
            </span>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="toko-baju-keren"
              required
              className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Hanya huruf kecil, angka, dan tanda hubung</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deskripsi Toko
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Ceritakan tentang toko kamu..."
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Mengirim...' : 'Ajukan Toko'}
        </button>
      </form>
    </div>
  )
}