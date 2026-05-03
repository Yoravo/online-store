// src/app/(main)/page.tsx
import Hero from "./sections/Hero";
// import Categories from "./sections/Categories";
import FeaturedProducts from "./sections/FeaturedProducts";
import Footer from "./sections/Footer";

// Next.js 16: Server Component by default ✅
export default function HomePage() {
  return (
    <>
      <Hero />
      {/* <Categories /> */}
      <FeaturedProducts />
      <Footer />
    </>
  );
}
