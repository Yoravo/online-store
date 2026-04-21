# TokoKu — Online Marketplace

Platform marketplace modern yang menghubungkan pembeli dan penjual di seluruh Indonesia.

## Tech Stack

- **Frontend & Backend** — Next.js 16 (App Router)
- **Database** — PostgreSQL via Supabase
- **ORM** — Prisma v7
- **Auth** — JWT + bcrypt (manual, tanpa library auth)
- **Payment** — Midtrans (coming soon)
- **Styling** — Tailwind CSS
- **Icons** — Lucide React

## Features

- Auth (register, login, logout) dengan role BUYER / SELLER / ADMIN
- Proteksi route via `proxy.ts`
- Multi-seller marketplace
- Produk dengan variant (ukuran, warna, dll)
- Keranjang belanja
- Order & checkout
- Integrasi Midtrans payment gateway
- Review & rating produk
- Wishlist
- Voucher diskon per toko
- Dashboard seller
- Admin panel
- Notifikasi

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (local atau Supabase)

### Installation

1. Clone repo

```bash
git clone https://github.com/Yoravo/online-store.git
cd online-store
```

2. Install dependencies

```bash
npm install
```

3. Setup environment variables

```bash
cp .env.example .env
```

Isi `.env` dengan:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="your-secret-key"
```

4. Generate Prisma Client

```bash
npx prisma generate
```

5. Push schema ke database

```bash
npx prisma db push
```

6. Jalankan dev server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Project Structure

src/
├── app/
│ ├── (auth)/ # Login & Register
│ ├── (main)/ # Halaman utama (home, produk, cart, dll)
│ ├── dashboard/ # Seller dashboard
│ ├── admin/ # Admin panel
│ └── api/ # API Routes
├── components/ # Reusable components
├── hooks/ # Custom React hooks
├── lib/ # Utilities (db, auth, dll)
└── types/ # TypeScript types

## License

MIT
