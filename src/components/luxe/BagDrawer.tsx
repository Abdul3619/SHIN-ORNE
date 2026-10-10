import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gift, Heart, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useProducts } from '../../context/ProductsContext';
import { useShop } from '../../context/ShopContext';
import { FREE_EXPRESS_FROM_USD, responsiveImage } from '../../lib/catalogue';

export default function BagDrawer() {
  const { cart, cartCount, cartTotal, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, toggleWishlist, wishlist } = useCart();
  const { formatPrice } = useCurrency();
  const { products } = useProducts();
  const { quickAdd } = useShop();

  useEffect(() => {
    if (!isCartOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsCartOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isCartOpen, setIsCartOpen]);

  // "Complete the look": pieces from other categories than what is already in the bag.
  const suggestions = useMemo(() => {
    const inBag = new Set(cart.map((i) => i.product.id));
    const cats = new Set(cart.map((i) => i.product.category));
    const fresh = products.filter((p) => !inBag.has(p.id));
    const other = fresh.filter((p) => !cats.has(p.category));
    return (other.length >= 2 ? other : fresh).slice(0, 2);
  }, [cart, products]);

  if (!isCartOpen) return null;

  const remaining = Math.max(0, FREE_EXPRESS_FROM_USD - cartTotal);
  const pct = Math.min(100, Math.round((cartTotal / FREE_EXPRESS_FROM_USD) * 100));
  const close = () => setIsCartOpen(false);

  return (
    <>
      <div className="lx-scrim" onClick={close} aria-hidden="true" />
      <aside className="lx-drawer" role="dialog" aria-modal="true" aria-labelledby="bag-title">
        <div className="lx-drawer-head">
          <h2 id="bag-title">Your Bag<small>{cartCount} {cartCount === 1 ? 'piece' : 'pieces'}</small></h2>
          <button type="button" className="lx-icon-btn" onClick={close} aria-label="Close bag" autoFocus>
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <div className="lx-drawer-body">
          {cart.length === 0 ? (
            <div className="lx-empty-cart">
              <ShoppingBag size={52} strokeWidth={1} aria-hidden="true" />
              <p>Your bag is waiting for its first piece.</p>
              <a href="/#shop" className="lx-btn" onClick={close}>Explore the collection</a>
            </div>
          ) : (
            <>
              <div className="lx-ship" role="status">
                {remaining === 0 ? (
                  <><Gift size={14} aria-hidden="true" style={{ display: 'inline', marginRight: 8, verticalAlign: '-2px' }} /><b>Express delivery is on us.</b> Your bag qualifies for free 1–2 day delivery.</>
                ) : (
                  <>Add <b>{formatPrice(remaining)}</b> more for complimentary express delivery.</>
                )}
                <div className="lx-meter" aria-hidden="true"><i style={{ width: `${Math.max(pct, 4)}%` }} /></div>
              </div>

              <ul className="lx-lines">
                {cart.map((item) => (
                  <li key={item.key} className="lx-line">
                    <img {...responsiveImage(item.product.image, [160, 320])} sizes="82px" alt="" referrerPolicy="no-referrer" />
                    <div>
                      <h3>{item.product.name}</h3>
                      {item.options?.ringSize && <p>Ring size {item.options.ringSize}</p>}
                      {item.options?.engraving && <p>Engraved “{item.options.engraving}”</p>}
                      <p>{formatPrice(item.product.price)}</p>
                      <div className="lx-line-row">
                        <div className="lx-qty">
                          <button type="button" aria-label={`Decrease quantity of ${item.product.name}`} onClick={() => updateQuantity(item.key, item.quantity - 1)}><Minus size={14} aria-hidden="true" /></button>
                          <span aria-label={`Quantity ${item.quantity}`}>{item.quantity}</span>
                          <button type="button" aria-label={`Increase quantity of ${item.product.name}`} onClick={() => updateQuantity(item.key, item.quantity + 1)}><Plus size={14} aria-hidden="true" /></button>
                        </div>
                        <span style={{ display: 'flex', gap: 14 }}>
                          <button
                            type="button"
                            className="lx-mini"
                            onClick={() => {
                              if (!wishlist.includes(item.product.id)) toggleWishlist(item.product.id);
                              removeFromCart(item.key);
                            }}
                            aria-label={`Save ${item.product.name} for later`}
                          >
                            <Heart size={13} aria-hidden="true" /> Later
                          </button>
                          <button type="button" className="lx-mini" onClick={() => removeFromCart(item.key)} aria-label={`Remove ${item.product.name} from bag`}>
                            <Trash2 size={13} aria-hidden="true" />
                          </button>
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {suggestions.length > 0 && (
                <div className="lx-upsell">
                  <h3>Complete the look</h3>
                  {suggestions.map((p) => (
                    <div key={p.id} className="lx-upsell-row">
                      <img {...responsiveImage(p.image, [120, 240])} sizes="56px" alt="" referrerPolicy="no-referrer" />
                      <div><b>{p.name}</b><small>{formatPrice(p.price)}</small></div>
                      <button type="button" className="lx-icon-btn" onClick={() => quickAdd(p)} aria-label={`Add ${p.name} to bag`}><Plus size={18} aria-hidden="true" /></button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="lx-drawer-foot">
            <div className="lx-sub"><span className="lx-label" style={{ margin: 0 }}>Subtotal</span><b>{formatPrice(cartTotal)}</b></div>
            <p className="lx-hint" style={{ marginBottom: 16 }}>Standard delivery is free. Your bag is saved on this device.</p>
            <Link to="/checkout" onClick={close} className="lx-btn lx-btn--solid lx-btn--block">
              Checkout <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
