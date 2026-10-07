import Header from '../components/Header';
import Hero from '../components/Hero';
import FeaturesBar from '../components/FeaturesBar';
import CategorySection from '../components/CategorySection';
import PromoBanner from '../components/PromoBanner';
import CraftsmanshipSection from '../components/CraftsmanshipSection';
import ProductGrid from '../components/ProductGrid';
import LookbookSection from '../components/LookbookSection';
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
        <PromoBanner
          image="photo-1605100804763-247f67b3557e"
          eyebrow="Bridal & Engagement"
          heading="For the Day You'll Remember Forever"
          subtext="Rings and sets built to carry a story, finished by hand and sized to fit."
          ctaLabel="Shop Bridal"
          ctaHref="/#bridal"
        />
        <CraftsmanshipSection />
        <ProductGrid />
        <LookbookSection />
        <AboutSection />
        <PromoBanner
          image="photo-1780744871777-fec13139d281"
          eyebrow="Gifting"
          heading="Give a Piece Worth Keeping"
          subtext="Every order ships in signature gift packaging, ready to hand over just as it arrives."
          ctaLabel="Shop All"
          ctaHref="/#shop-all"
          theme="light"
          align="center"
        />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}
