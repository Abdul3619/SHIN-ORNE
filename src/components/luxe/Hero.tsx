import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useProducts } from '../../context/ProductsContext';
import { useShop } from '../../context/ShopContext';
import { GEMS, unsplashUrl } from '../../lib/catalogue';
import GemPhoto from './GemPhoto';
import SilkCanvas from './SilkCanvas';

const SLIDES = [
  { image: 'photo-1788495545073-51161449ca9e', eyebrow: 'Bridal & Engagement', title: 'More than jewelry,', em: "it's your story", text: 'Engagement rings and wedding bands, finished by hand, sized to the finger and engraved with the words that matter.', piece: 'Aurora Halo Engagement Ring', material: 'Gold finish · Halo setting', cta: { label: 'Explore bridal', href: '/#bridal' } },
  { image: 'photo-1782988112531-a189b256440e', eyebrow: 'Wedding bands', title: 'Forged in fire,', em: 'finished by hand', text: 'A matching pair of bands with the warmth of molten gold. Made to be worn every day for a very long time.', piece: 'Ember Pair Wedding Bands', material: 'Matching pair · Engravable', cta: { label: 'See the bands', href: '/#bridal' } },
  { image: 'photo-1735480165036-3d1d2f41460f', eyebrow: 'Gemstone rings', title: 'Colour with', em: 'a pulse', text: 'Deep sapphire blue set against gold. For the person who wants a ring that is unmistakably theirs.', piece: 'Midnight Sapphire Solitaire', material: 'Sapphire tone · Solitaire', cta: { label: 'Meet the gemstones', href: '/#gemstones' } },
  { image: 'photo-1769038931426-dba74f079ccd', eyebrow: 'The ring atelier', title: 'Vows, made', em: 'to be worn', text: 'Choose your piece, pick the size, add your engraving and watch it take shape before you order.', piece: 'Eternal Hands Duo Set', material: 'Duo set · Engravable', cta: { label: 'Design your ring', href: '/#atelier' } },
];

const SLIDE_MS = 7000;

export default function Hero() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0); // restarts the progress bar
  const { products } = useProducts();
  const { formatPrice } = useCurrency();
  const { quickAdd } = useShop();

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => setIdx((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [idx, paused, tick]);

  const go = (n: number) => { setIdx((n + SLIDES.length) % SLIDES.length); setTick((t) => t + 1); };
  const slide = SLIDES[idx];
  const piece = useMemo(() => products.find((p) => p.name === slide.piece) ?? null, [products, slide.piece]);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section
      id="home"
      className="lx-hero"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); setTick((t) => t + 1); }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => { setPaused(false); setTick((t) => t + 1); }}
    >
      {SLIDES.map((s, i) => (
        <div key={s.image} className={`lx-slide${i === idx ? ' is-active' : ''}`} aria-hidden={i !== idx}>
          <img src={unsplashUrl(s.image, 1600)} srcSet={[800, 1200, 1600, 2200].map((w) => `${unsplashUrl(s.image, w)} ${w}w`).join(', ')} sizes="100vw" alt="" loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'auto'} referrerPolicy="no-referrer" />
        </div>
      ))}
      <div className="lx-rays" aria-hidden="true" />
      <SilkCanvas variant="hero" />
      <div className="lx-gem-float" style={{ top: '16%', right: '30%', ['--r' as string]: '-12deg' }} aria-hidden="true"><GemPhoto gem={GEMS[0]} eager className="lx-float-gem" /></div>
      <div className="lx-gem-float" style={{ bottom: '24%', right: '12%', animationDelay: '-3s', ['--r' as string]: '18deg' }} aria-hidden="true"><GemPhoto gem={GEMS[1]} eager className="lx-float-gem" /></div>
      <div className="lx-gem-float" style={{ top: '30%', left: '52%', animationDelay: '-5s', opacity: 0.8, ['--r' as string]: '30deg' }} aria-hidden="true"><GemPhoto gem={GEMS[4]} eager className="lx-float-gem" /></div>

      <div className="lx-wrap lx-hero-inner">
        <div className="lx-hero-copy" key={idx} style={{ animation: 'lx-rise 0.9s ease both' }} aria-live={paused ? 'polite' : 'off'}>
          <span className="lx-eyebrow">{slide.eyebrow}</span>
          <h1>{slide.title}<em>{slide.em}</em></h1>
          <p className="lx-hero-lede">{slide.text}</p>
          <div className="lx-cta-row">
            <a className="lx-btn lx-btn--solid" href={slide.cta.href}>{slide.cta.label} <ArrowRight size={15} aria-hidden="true" /></a>
            <a className="lx-btn" href="/#collections">Browse collections</a>
          </div>
        </div>
      </div>

      {piece && (
        <aside className="lx-glass lx-hot" key={`hot-${idx}`} style={{ animation: 'lx-rise 1s 0.3s ease both' }} aria-label="Featured piece">
          <small>Featured piece</small>
          <h3>{piece.name}</h3>
          <p>{slide.material}</p>
          <div className="lx-hot-row">
            <b>{formatPrice(piece.price)}</b>
            <button type="button" className="lx-plus" onClick={() => quickAdd(piece)} aria-label={`Add ${piece.name} to bag`}><Plus size={18} aria-hidden="true" /></button>
          </div>
        </aside>
      )}

      <div className="lx-hero-ui">
        <div className="lx-wrap">
          <div className="lx-count" aria-live="off"><b>{pad(idx + 1)}</b> / {pad(SLIDES.length)}</div>
          <div className="lx-dots">
            {SLIDES.map((s, i) => (
              <button key={s.image} type="button" className={i === idx ? 'is-active' : ''} onClick={() => go(i)} aria-label={`Show slide ${i + 1}: ${s.eyebrow}`} aria-current={i === idx}>
                {i === idx && <i key={tick} style={{ animationPlayState: paused ? 'paused' : 'running' }} />}
              </button>
            ))}
          </div>
          <div className="lx-hero-arrows">
            <button type="button" onClick={() => go(idx - 1)} aria-label="Previous slide"><ArrowLeft size={18} aria-hidden="true" /></button>
            <button type="button" onClick={() => go(idx + 1)} aria-label="Next slide"><ArrowRight size={18} aria-hidden="true" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
