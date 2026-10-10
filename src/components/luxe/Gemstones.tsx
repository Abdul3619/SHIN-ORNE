import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';
import { useShop } from '../../context/ShopContext';
import { GEMS, matchByWords } from '../../lib/catalogue';
import GemPhoto from './GemPhoto';

export default function Gemstones() {
  const [key, setKey] = useState<string>(GEMS[0].key);
  const { products } = useProducts();
  const { browse } = useShop();
  const gem = GEMS.find((g) => g.key === key)!;
  const matches = matchByWords(products, gem.words, 8);
  const similar = 'similar' in gem && gem.similar;

  return (
    <section id="gemstones" className="lx-section" aria-labelledby="gem-h">
      <div className="lx-wrap">
        <div className="lx-head lx-center">
          <span className="lx-eyebrow">Choose your gemstone</span>
          <h2 id="gem-h" className="lx-h2">Nature&rsquo;s rarest <em>treasures</em></h2>
          <p className="lx-lede">Each stone tells a different story. Tap one to read it and see the pieces that carry it.</p>
        </div>
        <div className="lx-gems" role="tablist" aria-label="Gemstones">
          {GEMS.map((g) => (
            <button key={g.key} type="button" role="tab" aria-selected={g.key === key} className={`lx-gem${g.key === key ? ' is-on' : ''}`} onClick={() => setKey(g.key)}>
              <GemPhoto gem={g} className="lx-gem-thumb" />
              <b>{g.name}</b>
              <span>{g.mood}</span>
            </button>
          ))}
        </div>
        <div className="lx-glass lx-gem-story" role="tabpanel" aria-live="polite">
          <div className="lx-gem-stage" key={gem.key} style={{ ['--gem-glow' as string]: gem.glow }}>
            <GemPhoto gem={gem} eager className="lx-gem-hero" />
            <i className="lx-gem-floor" aria-hidden="true" />
          </div>
          <div>
            <span className="lx-eyebrow" style={{ marginBottom: 8 }}>{gem.mood}</span>
            <h3>{gem.name}</h3>
            <p>{gem.story}</p>
            <div className="lx-gem-meta">{gem.facts.map((f) => (<span key={f}>{f}</span>))}</div>
            <p className="lx-hint" style={{ marginTop: 16 }}>
              {matches.length > 0
                ? `${similar ? 'Closest in the collection' : 'In the collection'}: ${matches.slice(0, 3).map((m) => m.name).join(', ')}.`
                : `We do not have a ${gem.name.toLowerCase()} piece in stock right now. Browse the rings instead.`}
            </p>
          </div>
          <div className="lx-gem-cta">
            <button
            type="button"
            className="lx-btn lx-btn--solid"
            onClick={() => (matches.length ? browse({ query: gem.words.join('|') }) : browse({ collection: 'rings' }))}
          >
            {matches.length ? `Shop ${similar ? 'the closest' : gem.name} pieces` : 'Shop rings'} <ArrowRight size={15} aria-hidden="true" />
            </button>
            <small className="lx-credit">Photo: {gem.credit} / Unsplash. Illustrative stone.</small>
          </div>
        </div>
      </div>
    </section>
  );
}
