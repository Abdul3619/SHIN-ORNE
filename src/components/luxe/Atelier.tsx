import { useEffect, useMemo, useState } from 'react';
import { Gem, Heart, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useProducts } from '../../context/ProductsContext';
import { ENGRAVING_MAX, RING_SIZES, hasRingOptions, responsiveImage } from '../../lib/catalogue';
import RingPreview from './RingPreview';

type Tab = 'piece' | 'size' | 'engraving';
const TABS: { key: Tab; label: string }[] = [
  { key: 'piece', label: 'Piece' },
  { key: 'size', label: 'Size' },
  { key: 'engraving', label: 'Engraving' },
];
const IDEAS = ['Forever', 'Yours always', 'A + B · 12.06.26'];

export default function Atelier() {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const rings = useMemo(() => products.filter(hasRingOptions), [products]);
  const [pieceId, setPieceId] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>('piece');
  const [size, setSize] = useState('');
  const [engraving, setEngraving] = useState('');
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => { if (pieceId === null && rings.length) setPieceId(rings[0].id); }, [rings, pieceId]);
  useEffect(() => { if (!added) return; const t = setTimeout(() => setAdded(false), 2500); return () => clearTimeout(t); }, [added]);
  const piece = rings.find((r) => r.id === pieceId) ?? null;

  const add = () => {
    if (!piece) return;
    if (!size) { setError('Choose a ring size first.'); setTab('size'); return; }
    addToCart(piece, { ringSize: size, engraving: engraving.trim() || undefined });
    setAdded(true);
    setError('');
  };

  return (
    <section id="atelier" className="lx-section" aria-labelledby="atelier-h">
      <div className="lx-wrap">
        <div className="lx-head lx-center">
          <span className="lx-eyebrow">The ring atelier</span>
          <h2 id="atelier-h" className="lx-h2">Design a ring <em>as unique as you</em></h2>
          <p className="lx-lede">Choose the piece, set the size, write your engraving and see it before you order. Your size and words travel with the order to our workshop.</p>
        </div>

        {!piece ? (
          <div className="lx-empty">Our rings are loading. If this stays empty, please refresh the page.</div>
        ) : (
          <div className="lx-atelier-grid">
            <div className="lx-stage">
              <img {...responsiveImage(piece.image, [600, 900])} sizes="50vw" alt="" referrerPolicy="no-referrer" />
              <RingPreview engraving={engraving} />
              <div className="lx-stage-label">
                <div><small>{piece.category}</small><h3>{piece.name}</h3></div>
                <b>{formatPrice(piece.price)}</b>
              </div>
            </div>

            <div className="lx-glass lx-panel">
              <div className="lx-tabs" role="tablist" aria-label="Ring options">
                {TABS.map((t) => (
                  <button key={t.key} type="button" role="tab" id={`tab-${t.key}`} aria-selected={tab === t.key} aria-controls={`panel-${t.key}`} className={tab === t.key ? 'is-on' : ''} onClick={() => setTab(t.key)}>{t.label}</button>
                ))}
              </div>

              <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} style={{ minHeight: 168 }}>
                {tab === 'piece' && (
                  <>
                    <span className="lx-label">Choose your piece</span>
                    <div className="lx-pieces">
                      {rings.map((r) => (
                        <button key={r.id} type="button" className={`lx-piece${r.id === pieceId ? ' is-on' : ''}`} onClick={() => setPieceId(r.id)} aria-label={`${r.name}, ${formatPrice(r.price)}`} aria-pressed={r.id === pieceId} title={r.name}>
                          <img {...responsiveImage(r.image, [160, 240])} sizes="90px" alt="" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {tab === 'size' && (
                  <>
                    <span className="lx-label" id="atelier-size">Ring size (UK)</span>
                    <div className="lx-sizes" role="radiogroup" aria-labelledby="atelier-size">
                      {RING_SIZES.map((s) => (
                        <button key={s} type="button" role="radio" aria-checked={size === s} className={`lx-size${size === s ? ' is-on' : ''}`} onClick={() => { setSize(s); setError(''); }}>{s}</button>
                      ))}
                    </div>
                    <p className="lx-hint">Not sure? Use the <a href="/#craft" style={{ textDecoration: 'underline' }}>ring sizer</a> below.</p>
                  </>
                )}
                {tab === 'engraving' && (
                  <>
                    <label className="lx-label" htmlFor="atelier-engr">Engraving, inside the band</label>
                    <input id="atelier-engr" className="lx-input" value={engraving} maxLength={ENGRAVING_MAX} onChange={(e) => setEngraving(e.target.value)} placeholder="Your words here" />
                    <p className="lx-hint">{engraving.length}/{ENGRAVING_MAX} characters</p>
                    <div className="lx-quick" style={{ marginTop: 10 }}>
                      {IDEAS.map((i) => (<button key={i} type="button" className="lx-chip" onClick={() => setEngraving(i)}>{i}</button>))}
                    </div>
                  </>
                )}
              </div>

              <div className="lx-total">
                <span>{size ? `Size ${size}` : 'No size yet'}{engraving.trim() ? ' · engraved' : ''}</span>
                <b>{formatPrice(piece.price)}</b>
              </div>
              {error && <p role="alert" className="lx-err" style={{ marginTop: -8 }}>{error}</p>}
              <button type="button" className="lx-btn lx-btn--solid lx-btn--block" onClick={add}>{added ? 'Added to your bag ✓' : 'Add to bag'}</button>
              <div className="lx-perks">
                <div><Gem size={20} aria-hidden="true" />Finished by hand</div>
                <div><ShieldCheck size={20} aria-hidden="true" />30-day returns*</div>
                <div><Heart size={20} aria-hidden="true" />Gift-ready box</div>
              </div>
              <p className="lx-hint" style={{ marginTop: -6 }}>*Unworn pieces. Engraved and resized rings are made for you and cannot be returned unless faulty.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
