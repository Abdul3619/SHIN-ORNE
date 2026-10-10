import { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useProducts } from '../../context/ProductsContext';
import { useShop } from '../../context/ShopContext';
import { STYLES, matchByWords, responsiveImage } from '../../lib/catalogue';

// A rule-based style finder (not an AI): each style maps to words that appear in real product names.
export default function StyleFinder() {
  const [styleKey, setStyleKey] = useState<string | null>(null);
  const { products } = useProducts();
  const { formatPrice } = useCurrency();
  const { quickAdd, browse } = useShop();
  const style = STYLES.find((s) => s.key === styleKey) ?? null;
  const picks = style ? matchByWords(products, style.words, 3) : [];

  return (
    <section id="stylist" className="lx-section" aria-labelledby="style-h">
      <div className="lx-wrap lx-stylist">
        <div>
          <span className="lx-eyebrow">Style finder</span>
          <h2 id="style-h" className="lx-h2">Find your <em>signature</em></h2>
          <p className="lx-lede">Not sure where to begin? Tell us how you like to dress and we will pull pieces from the collection that fit. A simple style guide, not a sales pitch.</p>
          <button type="button" className="lx-btn" onClick={() => browse({})}>Browse everything</button>
        </div>
        <div className="lx-glass lx-style-card">
          <div className="lx-who">
            <span className="lx-avatar" aria-hidden="true">S</span>
            <div><b>Shin Orne style guide</b><small>Pick a mood</small></div>
          </div>
          <div className="lx-bubble">What vibe are you going for today?</div>
          <div className="lx-chips" role="group" aria-label="Choose a style">
            {STYLES.map((s) => (<button key={s.key} type="button" className={`lx-chip${s.key === styleKey ? ' is-on' : ''}`} aria-pressed={s.key === styleKey} onClick={() => setStyleKey(s.key)}>{s.label}</button>))}
          </div>
          {style && (
            <div aria-live="polite">
              <div className="lx-bubble me">{style.label}</div>
              <div className="lx-bubble">{style.reply}</div>
              <div className="lx-picks">
                {picks.length === 0 && <p className="lx-hint">No close matches right now. <button type="button" className="lx-mini" onClick={() => browse({})} style={{ textDecoration: 'underline' }}>Browse all pieces</button></p>}
                {picks.map((p) => (
                  <div key={p.id} className="lx-pick">
                    <img {...responsiveImage(p.image, [168, 336])} sizes="84px" alt="" referrerPolicy="no-referrer" />
                    <div><h4>{p.name}</h4><p>{p.category} · {formatPrice(p.price)}</p></div>
                    <button type="button" className="lx-icon-btn" style={{ borderColor: 'var(--lx-line)' }} onClick={() => quickAdd(p)} aria-label={`Add ${p.name} to bag`}><Plus size={18} aria-hidden="true" /></button>
                  </div>
                ))}
              </div>
              <button type="button" className="lx-mini" style={{ marginTop: 14 }} onClick={() => setStyleKey(null)}><RotateCcw size={13} aria-hidden="true" /> Try another mood</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
