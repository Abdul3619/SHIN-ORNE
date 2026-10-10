import { ArrowRight } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useProducts } from '../../context/ProductsContext';
import { useShop } from '../../context/ShopContext';
import { CATEGORY_BLURB, COLLECTIONS, inCollection, unsplashUrl } from '../../lib/catalogue';

export default function Collections() {
  const { products } = useProducts();
  const { formatPrice } = useCurrency();
  const { browse } = useShop();

  return (
    <section id="collections" className="lx-section" aria-labelledby="collections-h">
      <div className="lx-wrap lx-split">
        <div>
          <span className="lx-eyebrow">Featured collections</span>
          <h2 id="collections-h" className="lx-h2">Iconic pieces for <em>modern love</em></h2>
          <p className="lx-lede">From stackable everyday rings to the piece you will propose with. Every collection is finished by hand.</p>
          <a className="lx-btn" href="/#shop-all">View all pieces <ArrowRight size={14} aria-hidden="true" /></a>
        </div>
        <div className="lx-coll">
          {COLLECTIONS.map((c, i) => {
            const items = products.filter((p) => inCollection(p, c.slug));
            const from = items.length ? Math.min(...items.map((p) => p.price)) : null;
            const inner = (
              <>
                <img src={unsplashUrl(c.image, 600)} srcSet={[400, 600, 900].map((w) => `${unsplashUrl(c.image, w)} ${w}w`).join(', ')} sizes="(min-width: 1020px) 16vw, 45vw" alt="" loading="lazy" referrerPolicy="no-referrer" />
                <span className="lx-tile-no">0{i + 1}</span>
                <span className="lx-tile-go"><ArrowRight size={15} aria-hidden="true" /></span>
                <span className="lx-tile-body">
                  <small>{items.length} {items.length === 1 ? 'piece' : 'pieces'}</small>
                  <h3>{c.name}</h3>
                  <p>{from !== null ? `From ${formatPrice(from)}` : CATEGORY_BLURB[c.slug]}</p>
                </span>
              </>
            );
            // Bridal has its own full section; every other tile filters the shop below.
            return c.slug === 'bridal' ? (
              <a key={c.slug} href="/#bridal" className="lx-tile" aria-label={`${c.name}: ${items.length} pieces`}>{inner}</a>
            ) : (
              <button key={c.slug} type="button" className="lx-tile" onClick={() => browse({ collection: c.slug })} aria-label={`Shop ${c.name}: ${items.length} pieces`}>{inner}</button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
