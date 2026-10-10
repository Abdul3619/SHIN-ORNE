import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useProducts } from '../../context/ProductsContext';
import { useShop } from '../../context/ShopContext';
import { inCollection, responsiveImage, unsplashUrl } from '../../lib/catalogue';
import ProductCard from './ProductCard';

const BUDGETS = [
  { key: 'under', label: 'Up to $400', sub: 'Promise rings and simple bands', test: (p: number) => p <= 400 },
  { key: 'mid', label: '$400 to $700', sub: 'Statement solitaires and pairs', test: (p: number) => p > 400 && p <= 700 },
  { key: 'high', label: '$700 and above', sub: 'Our grandest engagement pieces', test: (p: number) => p > 700 },
] as const;
const KINDS = [
  { key: 'engage', label: 'An engagement ring', sub: 'To ask the question', words: ['engagement', 'solitaire', 'halo', 'sapphire'] },
  { key: 'bands', label: 'Wedding bands', sub: 'To seal the answer', words: ['band', 'pair', 'duo', 'ember', 'vow', 'stack'] },
];

export default function Bridal() {
  const { products } = useProducts();
  const { browse, quickAdd } = useShop();
  const { formatPrice } = useCurrency();
  const rail = useRef<HTMLDivElement>(null);
  const bridal = useMemo(() => products.filter((p) => inCollection(p, 'bridal')), [products]);

  // Bridal planner: two questions, then real pieces from this collection.
  const [kind, setKind] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const step = kind === null ? 0 : budget === null ? 1 : 2;
  const picks = useMemo(() => {
    if (step < 2) return [];
    const k = KINDS.find((x) => x.key === kind)!;
    const b = BUDGETS.find((x) => x.key === budget)!;
    const fits = bridal.filter((p) => b.test(p.price));
    const ranked = [...fits].sort((x, y) => Number(k.words.some((w) => y.name.toLowerCase().includes(w))) - Number(k.words.some((w) => x.name.toLowerCase().includes(w))));
    return (ranked.length ? ranked : [...bridal].sort((x, y) => Math.abs(x.price - 500) - Math.abs(y.price - 500))).slice(0, 3);
  }, [step, kind, budget, bridal]);
  const noExactFit = step === 2 && !bridal.some((p) => BUDGETS.find((x) => x.key === budget)!.test(p.price));
  const scroll = (dir: number) => rail.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  const hero = 'photo-1769038936714-0c0ac933c379';

  return (
    <section id="bridal" className="lx-section lx-bridal" aria-labelledby="bridal-h">
      <div className="lx-wrap">
        <div className="lx-bridal-hero">
          <img src={unsplashUrl(hero, 1600)} srcSet={[800, 1200, 1800].map((w) => `${unsplashUrl(hero, w)} ${w}w`).join(', ')} sizes="100vw" alt="" loading="lazy" referrerPolicy="no-referrer" />
          <div className="lx-bridal-copy">
            <span className="lx-eyebrow">Bridal &amp; Engagement</span>
            <h2 id="bridal-h" className="lx-h2" style={{ color: '#fff0f5' }}>For the day you will <em style={{ color: '#ff9fba' }}>remember forever</em></h2>
            <p className="lx-lede">Engagement rings, wedding bands and matching sets, finished by hand, sized to the finger and engraved with the words only the two of you know.</p>
            <div className="lx-cta-row">
              <a className="lx-btn lx-btn--solid" href="#bridal-planner">Plan your ring <ArrowRight size={15} aria-hidden="true" /></a>
              <button type="button" className="lx-btn" onClick={() => browse({ collection: 'bridal' })}>Shop all bridal</button>
            </div>
          </div>
        </div>

        <div className="lx-rail-head">
          <div>
            <span className="lx-eyebrow" style={{ marginBottom: 8 }}>{bridal.length} bridal pieces</span>
            <h3>The bridal collection</h3>
          </div>
          <div className="lx-rail-nav">
            <button type="button" onClick={() => scroll(-1)} aria-label="Scroll bridal pieces left"><ArrowLeft size={17} aria-hidden="true" /></button>
            <button type="button" onClick={() => scroll(1)} aria-label="Scroll bridal pieces right"><ArrowRight size={17} aria-hidden="true" /></button>
          </div>
        </div>
        <div className="lx-rail" ref={rail} tabIndex={0} role="region" aria-label="Bridal pieces">
          {bridal.length === 0 && <p className="lx-empty" style={{ flex: '1 0 100%' }}>New bridal pieces are being photographed. Check back very soon.</p>}
          {bridal.map((p, i) => (<ProductCard key={p.id} product={p} tag={i === 0 ? 'Signature' : undefined} />))}
        </div>

        <div id="bridal-planner" className="lx-glass lx-planner" style={{ scrollMarginTop: 100 }}>
          <div className="lx-planner-grid">
            <div>
              <span className="lx-eyebrow">Bridal planner</span>
              <h3 className="lx-h2" style={{ fontSize: 'clamp(1.8rem,3.4vw,2.6rem)' }}>Two questions, <em>three pieces</em></h3>
              <p className="lx-lede" style={{ marginBottom: 0 }}>Tell us what you are looking for and your budget. We will pick from the real bridal collection and let you size and engrave in one step.</p>
            </div>
            <div>
              <div className="lx-steps" aria-hidden="true"><i className="on" /><i className={step >= 1 ? 'on' : ''} /><i className={step >= 2 ? 'on' : ''} /></div>
              {step === 0 && (
                <div>
                  <h4 className="lx-q">What are you looking for?</h4>
                  <div className="lx-opts">
                    {KINDS.map((k) => (<button key={k.key} type="button" className="lx-opt" onClick={() => setKind(k.key)}><span>{k.label}<small>{k.sub}</small></span><ArrowRight size={16} aria-hidden="true" /></button>))}
                  </div>
                </div>
              )}
              {step === 1 && (
                <div>
                  <h4 className="lx-q">What is your budget?</h4>
                  <div className="lx-opts">
                    {BUDGETS.map((b) => (<button key={b.key} type="button" className="lx-opt" onClick={() => setBudget(b.key)}><span>{b.label}<small>{b.sub}</small></span><ArrowRight size={16} aria-hidden="true" /></button>))}
                  </div>
                  <button type="button" className="lx-mini" style={{ marginTop: 16 }} onClick={() => setKind(null)}><ArrowLeft size={13} aria-hidden="true" /> Back</button>
                </div>
              )}
              {step === 2 && (
                <div>
                  <h4 className="lx-q">{noExactFit ? 'Closest to your budget' : 'Your shortlist'}</h4>
                  <div className="lx-picks">
                    {picks.map((p) => (
                      <div key={p.id} className="lx-pick">
                        <img {...responsiveImage(p.image, [168, 336])} sizes="84px" alt="" referrerPolicy="no-referrer" />
                        <div><h4>{p.name}</h4><p>{formatPrice(p.price)}</p></div>
                        <button type="button" className="lx-icon-btn" style={{ borderColor: 'var(--lx-line)' }} onClick={() => quickAdd(p)} aria-label={`Size and add ${p.name} to bag`}><Plus size={18} aria-hidden="true" /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="lx-mini" style={{ marginTop: 16 }} onClick={() => { setKind(null); setBudget(null); }}><ArrowLeft size={13} aria-hidden="true" /> Start again</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
