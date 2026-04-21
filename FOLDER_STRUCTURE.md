online-store/
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── (auth)/ # Route group auth
│ │ │ ├── login/
│ │ │ │ └── page.tsx
│ │ │ └── register/
│ │ │ └── page.tsx
│ │ │
│ │ ├── (main)/ # Route group halaman utama
│ │ │ ├── layout.tsx # Layout dengan navbar
│ │ │ ├── page.tsx # Homepage
│ │ │ ├── products/
│ │ │ │ ├── page.tsx # List semua produk
│ │ │ │ └── [slug]/
│ │ │ │ └── page.tsx # Detail produk
│ │ │ ├── stores/
│ │ │ │ └── [slug]/
│ │ │ │ └── page.tsx # Halaman toko seller
│ │ │ ├── cart/
│ │ │ │ └── page.tsx
│ │ │ ├── checkout/
│ │ │ │ └── page.tsx
│ │ │ ├── orders/
│ │ │ │ ├── page.tsx # List order user
│ │ │ │ └── [id]/
│ │ │ │ └── page.tsx # Detail order
│ │ │ └── wishlist/
│ │ │ └── page.tsx
│ │ │
│ │ ├── dashboard/ # Seller dashboard
│ │ │ ├── layout.tsx
│ │ │ ├── page.tsx # Overview toko
│ │ │ ├── products/
│ │ │ │ ├── page.tsx # Kelola produk
│ │ │ │ ├── create/
│ │ │ │ │ └── page.tsx
│ │ │ │ └── [id]/
│ │ │ │ └── page.tsx # Edit produk
│ │ │ ├── orders/
│ │ │ │ └── page.tsx # Kelola order masuk
│ │ │ └── vouchers/
│ │ │ └── page.tsx
│ │ │
│ │ ├── admin/ # Admin panel
│ │ │ ├── layout.tsx
│ │ │ ├── page.tsx
│ │ │ ├── users/
│ │ │ │ └── page.tsx
│ │ │ ├── stores/
│ │ │ │ └── page.tsx
│ │ │ └── categories/
│ │ │ └── page.tsx
│ │ │
│ │ ├── api/ # API Routes
│ │ │ ├── auth/
│ │ │ │ ├── register/
│ │ │ │ │ └── route.ts
│ │ │ │ └── login/
│ │ │ │ └── route.ts
│ │ │ ├── products/
│ │ │ │ ├── route.ts # GET list, POST create
│ │ │ │ └── [id]/
│ │ │ │ └── route.ts # GET, PUT, DELETE
│ │ │ ├── cart/
│ │ │ │ └── route.ts
│ │ │ ├── orders/
│ │ │ │ └── route.ts
│ │ │ ├── payment/
│ │ │ │ ├── route.ts # Create Midtrans token
│ │ │ │ └── notification/
│ │ │ │ └── route.ts # Midtrans webhook
│ │ │ └── upload/
│ │ │ └── route.ts # Upload gambar ke Supabase Storage
│ │ │
│ │ ├── layout.tsx # Root layout
│ │ └── globals.css
│ │
│ ├── components/ # Reusable components
│ │ ├── ui/ # Komponen dasar (button, input, dll)
│ │ ├── shared/ # Komponen shared (Navbar, Footer)
│ │ ├── product/ # Komponen terkait produk
│ │ ├── cart/
│ │ ├── order/
│ │ └── dashboard/
│ │
│ ├── lib/ # Utilities & config
│ │ ├── db.ts # Prisma singleton (sudah ada)
│ │ ├── midtrans.ts # Midtrans config
│ │ ├── supabase.ts # Supabase Storage client
│ │ └── utils.ts # Helper functions
│ │
│ ├── hooks/ # Custom React hooks
│ │ ├── useCart.ts
│ │ └── useAuth.ts
│ │
│ ├── types/ # TypeScript types
│ │ └── index.ts
│ │
│ ├── generated/ # Prisma generated (jangan diedit manual)
│ │ └── prisma/
│ │
│ └── middleware.ts # Auth middleware (proteksi route)
│
├── prisma/
│ └── schema.prisma
├── prisma.config.ts
├── .env
└── next.config.ts
