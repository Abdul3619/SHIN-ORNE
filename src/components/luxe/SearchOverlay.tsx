import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useProducts } from '../../context/ProductsContext';
import { useShop } from '../../context/ShopContext';
import { COLLECTIONS, GEMS, responsiveImage } from '../../lib/catalogue';

const SUGGESTIONS = ['Engagement', 'Gold band', 'Pearl', 'Sapphire', 'Emerald', 'Silver'];

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen, browse, quickAdd } = useShop();
  const { products } = useProducts();
  const { formatPrice } = useCurrency();
  const [q, setQ] = useState('');
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    setQ('');
    requestAnimationFrame(() => input.current?.focus());
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSearchOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [searchOpen, setSearchOpen]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(t)).slice(0, 8);
  }, [q, products]);

  if (!searchOpen) return null;
  const close = () => setSearchOpen(false);
  const seeAll = () => { close(); browse({ query: q.trim() }); };

  return (
    <div className="lx-search" role="dialog" aria-modal="true" aria-label="Search" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="lx-glass lx-search-box">
        <button type="button" className="lx-close" onClick={close} aria-label="Close search"><X size={18} aria-hidden="true" /></button>
        <label className="lx-sr" htmlFor="lx-q">Search the collection</label>
        <form className="lx-search-wrap" onSubmit={(e) => { e.preventDefault(); if (q.trim()) seeAll(); }} role="search">
          <Search size={22} aria-hidden="true" />
          <input id="lx-q" ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search rings, gems, bridal…" autoComplete="off" />
        </form>
        {q.trim() === '' ? (
          <>
            <div className="lx-quick" aria-label="Suggestions">
              {SUGGESTIONS.map((s) => (<button key={s} type="button" className="lx-chip" onClick={() => setQ(s)}>{s}</button>))}
            </div>
            <div className="lx-quick" aria-label="Collections">
              {COLLECTIONS.map((c) => (
                <a key={c.slug} className="lx-chip" href={c.slug === 'bridal' ? '/#bridal' : `/#${c.slug}`} onClick={close}>{c.name}</a>
              ))}
              {GEMS.slice(0, 3).map((g) => (<a key={g.key} className="lx-chip" href="/#gemstones" onClick={close}>{g.name}</a>))}
            </div>
          </>
        ) : results.length === 0 ? (
          <p className="lx-hint" style={{ marginTop: 22 }}>Nothing matches “{q.trim()}” yet. Try “ring”, “pearl” or “gold”.</p>
        ) : (
          <div className="lx-results" role="list">
            {results.map((p) => (
              <button key={p.id} type="button" role="listitem" className="lx-result" onClick={() => { close(); quickAdd(p); }}>
                <img {...responsiveImage(p.image, [112, 224])} sizes="56px" alt="" referrerPolicy="no-referrer" />
                <span><small>{p.category}</small><b>{p.name}</b></span>
                <span>{formatPrice(p.price)}</span>
              </button>
            ))}
            <button type="button" className="lx-link" style={{ justifySelf: 'start', margin: '10px 8px' }} onClick={seeAll}>See all results in the shop</button>
          </div>
        )}
      </div>
    </div>
  );
}
