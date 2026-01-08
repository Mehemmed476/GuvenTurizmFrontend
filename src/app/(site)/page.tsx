import HeroSection from "@/components/HeroSection";
import FeaturedProperties from "@/components/FeaturedProperties";
import FAQSection from "@/components/FAQSection"; // <--- 1. Import et
import NewestTours from "@/components/NewestTours";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection />

      <FeaturedProperties />

      <NewestTours />
      {/* 2. Bura əlavə et */}
      <FAQSection />
    </main>
  );
}