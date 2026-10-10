import Shell from '../components/luxe/Shell';
import Hero from '../components/luxe/Hero';
import Marquee from '../components/luxe/Marquee';
import Collections from '../components/luxe/Collections';
import Bridal from '../components/luxe/Bridal';
import Atelier from '../components/luxe/Atelier';
import Craft from '../components/luxe/Craft';
import Gemstones from '../components/luxe/Gemstones';
import StyleFinder from '../components/luxe/StyleFinder';
import Shop from '../components/luxe/Shop';
import Gifting from '../components/luxe/Gifting';
import Stories from '../components/luxe/Stories';
import About from '../components/luxe/About';
import Testimonials from '../components/luxe/Testimonials';

export default function Storefront() {
  return (
    <Shell>
      <Hero />
      <Marquee />
      <Collections />
      <Bridal />
      <Atelier />
      <Craft />
      <Gemstones />
      <StyleFinder />
      <Shop />
      <Gifting />
      <Stories />
      <About />
      <Testimonials />
    </Shell>
  );
}
