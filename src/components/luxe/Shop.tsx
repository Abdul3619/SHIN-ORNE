import { useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';
import { useShop, type Sort } from '../../context/ShopContext';
import { useCurrency } from '../../context/CurrencyContext';
import { COLLECTIONS, inCollection } from '../../lib/catalogue';
import ProductCard from './ProductCard';

function SkeletonGrid() {
  return (
    <div className="lx-grid" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i}>
          <div className="lx-skel" style={{ aspectRatio: '4 / 5', marginBottom: 14 }} />
          <div className="lx-skel" style={{ height: 12, width: 80, marginBottom: 8 }} />
          <div className="lx-skel" style={{ height: 20, width: '70%', marginBottom: 8 }} />
          <div className="lx-skel" style={{ height: 16, width: 60 }} />
        </div>
      ))}
    </div>
  );
}

export default function Shop() {
  const { products, loading, error } = useProducts();
  const { filter, setFilter, reset } = useShop();
  const { formatPrice } = useCurrency();

  const visible = useMemo(() => {
    const terms = filter.query.toLowerCase().split('|').map((t) => t.trim()).filter(Boolean);
    let list = products.filter((p) => {
      if (filter.collection && !inCollection(p, filter.collection)) return false;
      if (terms.length && !terms.some((t) => `${p.name} ${p.category}`.toLowerCase().includes(t))) return false;
      if (filter.max !== null && p.price > filter.max) return false;
      if (filter.min !== null && p.price < filter.min) return false;
      return true;
    });
    if (filter.sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (filter.sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, filter]);

  const active = filter.collection || filter.query || filter.max !== null || filter.min !== null;
  const heading = filter.collection ? COLLECTIONS.find((c) => c.slug === filter.collection)!.name : 'The collection';
  const queryLabel = filter.query.split('|').filter(Boolean).slice(0, 2).join(' / ');
  const priceLabel = filter.max !== null && filter.min !== null ? `${formatPrice(filter.min)} to ${formatPrice(filter.max)}` : filter.max !== null ? `Up to ${formatPrice(filter.max)}` : filter.min !== null ? `${formatPrice(filter.min)} and above` : '';

  return (
    <section id="shop" className="lx-section" aria-labelledby="shop-h">
      <div className="lx-wrap">
        <div className="lx-head">
          <span className="lx-eyebrow">Shop</span>
          <h2 id="shop-h" className="lx-h2">{heading} <em>{active ? '' : 'in full'}</em></h2>
          <p className="lx-lede" style={{ marginBottom: 0 }}>Every piece in the Shin Orne collection. Filter by collection, search, or sort by price.</p>
        </div>

        <nav className="lx-filters" aria-label="Filter by collection">
          <button type="button" className={`lx-chip${!filter.collection ? ' is-on' : ''}`} aria-pressed={!filter.collection} onClick={() => setFilter({ collection: null })}>All</button>
          {COLLECTIONS.map((c) => (
            <button key={c.slug} type="button" className={`lx-chip${filter.collection === c.slug ? ' is-on' : ''}`} aria-pressed={filter.collection === c.slug} onClick={() => setFilter({ collection: c.slug })}>{c.name}</button>
          ))}
        </nav>

        <div className="lx-toolbar">
          <p role="status">
            {loading ? 'Loading pieces…' : `${visible.length} ${visible.length === 1 ? 'piece' : 'pieces'}`}
            {queryLabel && <> · matching “{queryLabel}”</>}
            {priceLabel && <> · {priceLabel}</>}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {active && <button type="button" className="lx-chip" onClick={reset}><X size={12} aria-hidden="true" style={{ display: 'inline', marginRight: 6, verticalAlign: '-1px' }} />Clear filters</button>}
            <label className="lx-sr" htmlFor="lx-sort">Sort pieces</label>
            <select id="lx-sort" className="lx-select" value={filter.sort} onChange={(e) => setFilter({ sort: e.target.value as Sort })}>
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <p role="alert" className="lx-empty">{error}</p>
        ) : (
          <div className="lx-grid">
            {visible.length === 0 && (
              <div className="lx-empty">
                <Search size={26} aria-hidden="true" style={{ margin: '0 auto 10px', color: 'var(--lx-gold)' }} />
                <p style={{ margin: '0 0 6px' }}>No pieces match that yet.</p>
                <button type="button" onClick={reset}>Show the whole collection</button>
              </div>
            )}
            {visible.map((p, i) => (<ProductCard key={p.id} product={p} tag={i < 2 && !active ? 'Best seller' : undefined} />))}
          </div>
        )}
        {!loading && !error && products.length > 1 && (
          <p className="lx-hint lx-center" style={{ marginTop: 30 }}><span className="lx-ill">Best seller tags are illustrative</span></p>
        )}
      </div>
    </section>
  );
}
