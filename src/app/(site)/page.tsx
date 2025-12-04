import HeroSection from "@/components/HeroSection";
import FeaturedProperties from "@/components/FeaturedProperties";
import FAQSection from "@/components/FAQSection"; // <--- 1. Import et

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection />

      <FeaturedProperties />

      {/* 2. Bura əlavə et */}
      <FAQSection />
    </main>
  );
}