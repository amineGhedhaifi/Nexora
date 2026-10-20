import { CategoryChips } from "@/components/home/CategoryChips";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Hero } from "@/components/home/Hero";
import { Testimonials } from "@/components/home/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryChips />
      <FeaturedProducts />
      <Testimonials />
    </>
  );
}
