import 'dotenv/config'
import { PrismaClient } from '@/src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding kategori...')

  const categories = [
    { name: 'Fashion Pria', slug: 'fashion-pria' },
    { name: 'Fashion Wanita', slug: 'fashion-wanita' },
    { name: 'Elektronik', slug: 'elektronik' },
    { name: 'Handphone & Tablet', slug: 'handphone-tablet', parent: 'elektronik' },
    { name: 'Laptop & Komputer', slug: 'laptop-komputer', parent: 'elektronik' },
    { name: 'Makanan & Minuman', slug: 'makanan-minuman' },
    { name: 'Kesehatan & Kecantikan', slug: 'kesehatan-kecantikan' },
    { name: 'Olahraga', slug: 'olahraga' },
    { name: 'Rumah & Taman', slug: 'rumah-taman' },
    { name: 'Hobi & Kolektibel', slug: 'hobi-kolektibel' },
  ]

  const parentCategories = categories.filter(c => !c.parent)
  const createdParents: Record<string, string> = {}

  for (const cat of parentCategories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug },
    })
    createdParents[cat.slug] = created.id
    console.log(`✓ ${cat.name}`)
  }

  const childCategories = categories.filter(c => c.parent)
  for (const cat of childCategories) {
    const parentId = createdParents[cat.parent!]
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, parent_id: parentId },
    })
    console.log(`  ✓ ${cat.name}`)
  }

  console.log('\nSeeding user & toko test...')

  // Buat seller test
  const bcrypt = await import('bcryptjs')
  const seller = await prisma.user.upsert({
    where: { email: 'seller@test.com' },
    update: {},
    create: {
      name: 'Seller Test',
      email: 'seller@test.com',
      password: await bcrypt.hash('password123', 10),
      role: 'SELLER',
      cart: { create: {} },
    },
  })
  console.log('✓ User seller')

  // Buat Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      name: 'Admin Test',
      email: 'admin@test.com',
      password: await bcrypt.hash('password123', 10),
      role: 'ADMIN',
      cart: { create: {} },
    },
  })
  console.log('✓ User admin')

  // Buat toko test
  const store = await prisma.store.upsert({
    where: { slug: 'toko-test' },
    update: {},
    create: {
      user_id: seller.id,
      name: 'Toko Test',
      slug: 'toko-test',
      description: 'Toko test untuk development',
    },
  })
  console.log('✓ Toko test')

  console.log('\nSeeding produk test...')

  const products = [
    {
      name: 'Kaos Polos Premium',
      slug: 'kaos-polos-premium',
      description: 'Kaos polos berbahan cotton combed 30s yang nyaman dipakai sehari-hari.',
      category: 'fashion-pria',
      variants: [
        { name: 'S', price: 85000, stock: 50 },
        { name: 'M', price: 85000, stock: 100 },
        { name: 'L', price: 90000, stock: 80 },
        { name: 'XL', price: 95000, stock: 60 },
      ],
    },
    {
      name: 'Celana Chino Slim Fit',
      slug: 'celana-chino-slim-fit',
      description: 'Celana chino slim fit cocok untuk casual maupun semi formal.',
      category: 'fashion-pria',
      variants: [
        { name: '30', price: 185000, stock: 40 },
        { name: '32', price: 185000, stock: 60 },
        { name: '34', price: 190000, stock: 30 },
      ],
    },
    {
      name: 'Dress Floral Wanita',
      slug: 'dress-floral-wanita',
      description: 'Dress motif bunga yang cantik dan elegan untuk berbagai kesempatan.',
      category: 'fashion-wanita',
      variants: [
        { name: 'S', price: 145000, stock: 30 },
        { name: 'M', price: 145000, stock: 50 },
        { name: 'L', price: 150000, stock: 25 },
      ],
    },
    {
      name: 'Earphone Bluetooth TWS',
      slug: 'earphone-bluetooth-tws',
      description: 'Earphone TWS dengan suara jernih dan baterai tahan lama hingga 6 jam.',
      category: 'elektronik',
      variants: [
        { name: 'Putih', price: 250000, stock: 45 },
        { name: 'Hitam', price: 250000, stock: 55 },
      ],
    },
    {
      name: 'Smartwatch Sport',
      slug: 'smartwatch-sport',
      description: 'Smartwatch dengan fitur monitor detak jantung, GPS, dan tahan air.',
      category: 'elektronik',
      variants: [
        { name: 'Hitam', price: 450000, stock: 20 },
        { name: 'Silver', price: 475000, stock: 15 },
      ],
    },
    {
      name: 'Kopi Arabika Single Origin',
      slug: 'kopi-arabika-single-origin',
      description: 'Biji kopi arabika pilihan dari dataran tinggi Gayo, Aceh.',
      category: 'makanan-minuman',
      variants: [
        { name: '200g', price: 75000, stock: 100 },
        { name: '500g', price: 165000, stock: 60 },
      ],
    },
    {
      name: 'Serum Vitamin C',
      slug: 'serum-vitamin-c',
      description: 'Serum vitamin C untuk mencerahkan kulit dan memudarkan noda hitam.',
      category: 'kesehatan-kecantikan',
      variants: [
        { name: '30ml', price: 95000, stock: 80 },
      ],
    },
    {
      name: 'Sepatu Running Ringan',
      slug: 'sepatu-running-ringan',
      description: 'Sepatu lari ringan dengan sol yang empuk dan breathable upper.',
      category: 'olahraga',
      variants: [
        { name: '39', price: 320000, stock: 20 },
        { name: '40', price: 320000, stock: 35 },
        { name: '41', price: 320000, stock: 40 },
        { name: '42', price: 320000, stock: 30 },
        { name: '43', price: 325000, stock: 15 },
      ],
    },
  ]

  // Ambil semua kategori
  const allCategories = await prisma.category.findMany()
  const categoryMap: Record<string, string> = {}
  allCategories.forEach(c => { categoryMap[c.slug] = c.id })

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        store_id: store.id,
        category_id: categoryMap[p.category],
        name: p.name,
        slug: p.slug,
        description: p.description,
        is_active: true,
      },
    })

    for (const v of p.variants) {
      await prisma.productVariant.upsert({
        where: { sku: `${p.slug}-${v.name.toLowerCase()}` },
        update: {},
        create: {
          product_id: product.id,
          name: v.name,
          price: v.price,
          stock: v.stock,
          sku: `${p.slug}-${v.name.toLowerCase()}`,
        },
      })
    }

    console.log(`✓ ${p.name}`)
  }

  console.log('\nSeeding selesai!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())