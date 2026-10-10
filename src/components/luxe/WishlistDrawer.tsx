import { useEffect } from 'react';
import { Heart, Plus, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useProducts } from '../../context/ProductsContext';
import { useShop } from '../../context/ShopContext';
import { responsiveImage } from '../../lib/catalogue';

export default function WishlistDrawer() {
  const { wishlist, toggleWishlist } = useCart();
  const { products } = useProducts();
  const { formatPrice } = useCurrency();
  const { wishlistOpen, setWishlistOpen, quickAdd } = useShop();

  useEffect(() => {
    if (!wishlistOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setWishlistOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [wishlistOpen, setWishlistOpen]);

  if (!wishlistOpen) return null;
  const saved = products.filter((p) => wishlist.includes(p.id));
  const close = () => setWishlistOpen(false);

  return (
    <>
      <div className="lx-scrim" onClick={close} aria-hidden="true" />
      <aside className="lx-drawer" role="dialog" aria-modal="true" aria-labelledby="wish-title">
        <div className="lx-drawer-head">
          <h2 id="wish-title">Wishlist<small>{saved.length} saved</small></h2>
          <button type="button" className="lx-icon-btn" onClick={close} aria-label="Close wishlist" autoFocus><X size={22} aria-hidden="true" /></button>
        </div>
        <div className="lx-drawer-body">
          {saved.length === 0 ? (
            <div className="lx-empty-cart">
              <Heart size={52} strokeWidth={1} aria-hidden="true" />
              <p>Tap the heart on any piece to keep it here.</p>
              <a href="/#shop" className="lx-btn" onClick={close}>Browse pieces</a>
            </div>
          ) : (
            <ul className="lx-lines">
              {saved.map((p) => (
                <li key={p.id} className="lx-line">
                  <img {...responsiveImage(p.image, [160, 320])} sizes="82px" alt="" referrerPolicy="no-referrer" />
                  <div>
                    <h3>{p.name}</h3>
                    <p>{p.category} · {formatPrice(p.price)}</p>
                    <div className="lx-line-row">
                      <button type="button" className="lx-btn lx-btn--sm" onClick={() => { quickAdd(p); close(); }}><Plus size={13} aria-hidden="true" /> Add to bag</button>
                      <button type="button" className="lx-mini" onClick={() => toggleWishlist(p.id)} aria-label={`Remove ${p.name} from wishlist`}><X size={13} aria-hidden="true" /> Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
