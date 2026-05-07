// src/app/(main)/page.tsx
import Categories from "./sections/Categories";
import FeaturedProducts from "./sections/FeaturedProducts";
import HomeHero from "./sections/HomeHero";

// Next.js 16: Server Component by default ✅
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <Categories />
      <FeaturedProducts />
    </>
  );
}
