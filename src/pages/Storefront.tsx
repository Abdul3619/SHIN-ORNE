import Header from '../components/Header';
import Hero from '../components/Hero';
import FeaturesBar from '../components/FeaturesBar';
import CategorySection from '../components/CategorySection';
import ProductGrid from '../components/ProductGrid';
import AboutSection from '../components/AboutSection';
import TestimonialsSection from '../components/TestimonialsSection';
import Footer from '../components/Footer';

export default function Storefront() {
  return (
    <div className="font-sans text-gray-900 antialiased bg-white selection:bg-[#D4AF37] selection:text-white">
      <Header />
      <main>
        <Hero />
        <FeaturesBar />
        <CategorySection />
        <AboutSection />
        <ProductGrid />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}
