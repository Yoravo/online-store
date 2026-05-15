import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/src/lib/db";
import ProductDetailClient from "./ProductDetailClient";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://tokoku.example.com";

async function getProduct(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, is_active: true },
    include: {
      category: { select: { name: true, slug: true } },
      store: { select: { id: true, name: true, slug: true, logo: true } },
      images: true,
      variants: { orderBy: { price: "asc" } },
      reviews: {
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { created_at: "desc" },
        take: 10,
      },
    },
  });
  if (!product) return null;
  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) /
      product.reviews.length
    : 0;
  return { product, avgRating };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) return { title: "Produk tidak ditemukan" };
  const { product } = data;
  const img =
    product.images.find((i) => i.is_primary) || product.images[0];

  return {
    title: product.name,
    description:
      product.description?.slice(0, 155) ??
      `${product.name} dari ${product.store.name}`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 155) ?? "",
      images: img ? [{ url: img.url, width: 800, height: 800 }] : [],
      url: `/products/${product.slug}`,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) notFound();
  const { product, avgRating } = data;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: product.store.name },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "IDR",
      lowPrice: Math.min(...product.variants.map((v) => Number(v.price))),
      highPrice: Math.max(...product.variants.map((v) => Number(v.price))),
      availability: product.variants.some((v) => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${BASE_URL}/products/${product.slug}`,
    },
    ...(product.reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: product.reviews.length,
      },
    }),
  };

  // Serialize for client component (Decimal → number, Date → string)
  const serialized = JSON.parse(JSON.stringify(product));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={serialized} avgRating={avgRating} />
    </>
  );
}
