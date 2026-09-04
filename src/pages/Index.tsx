import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import OccasionCategories from "@/components/OccasionCategories";
import ProductGrid from "@/components/ProductGrid";
import GallerySection from "@/components/GallerySection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-display">
      <SEO />
      <Navbar />

      <HeroSection />
      <AnimatedSection>
        <OccasionCategories />
      </AnimatedSection>
      <AnimatedSection delay={0.1} className="bg-accent/30 py-16 md:py-24">
        <ProductGrid />
      </AnimatedSection>
      <AnimatedSection delay={0.1}>
        <GallerySection />
      </AnimatedSection>
      <AnimatedSection delay={0.1} className="bg-card py-16 md:py-24">
        <FAQSection />
      </AnimatedSection>
      <Footer />
    </div>
  );
};

export default Index;
