import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useShop } from '../../context/ShopContext';
import ThemeSwitch from './ThemeSwitch';

// Every link goes to a real section id on the storefront (see Storefront.tsx).
export const NAV = [
  { label: 'Collections', href: '/#collections' },
  { label: 'Bridal', href: '/#bridal' },
  { label: 'Atelier', href: '/#atelier' },
  { label: 'Gemstones', href: '/#gemstones' },
  { label: 'Craft', href: '/#craft' },
  { label: 'Gifting', href: '/#gifting' },
  { label: 'Shop', href: '/#shop' },
];

export default function Header({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const { currency, setCurrency } = useCurrency();
  const { cartCount, setIsCartOpen, wishlist, hydrated } = useCart();
  const { setSearchOpen, setWishlistOpen } = useShop();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menu]);

  // Scroll-spy: highlight the nav link of the section currently in view (home page only).
  const [active, setActive] = useState('');
  useEffect(() => {
    if (window.location.pathname !== '/') return;
    const ids = NAV.map((n) => n.href.split('#')[1]);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    const top = () => { if (window.scrollY < 200) setActive(''); };
    window.addEventListener('scroll', top, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', top); };
  }, []);

  const count = hydrated ? cartCount : 0;
  const saved = hydrated ? wishlist.length : 0;

  return (
    <>
      <header className={`lx-header${solid || scrolled ? ' is-solid' : ''}`}>
        <div className="lx-wrap">
          <Link to="/" className="lx-logo" aria-label="Shin Orne by Charm Aura, home">
            <b>SHIN ORNE</b>
            <span>by Charm Aura</span>
          </Link>
          <nav className="lx-nav" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.label} to={n.href} className={active === n.href.split('#')[1] ? 'is-current' : undefined} aria-current={active === n.href.split('#')[1] ? 'true' : undefined}>{n.label}</Link>
            ))}
          </nav>
          <div className="lx-actions">
            <button type="button" className="lx-search-pill" onClick={() => setSearchOpen(true)} aria-label="Search the collection">
              <Search size={15} aria-hidden="true" /> Search rings, gems…
            </button>
            <select className="lx-select" aria-label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value as 'NGN' | 'USD')}>
              <option value="NGN">NGN ₦</option>
              <option value="USD">USD $</option>
            </select>
            <ThemeSwitch />
            <button type="button" className="lx-icon-btn" onClick={() => setWishlistOpen(true)} aria-label={`Wishlist (${saved} saved)`}>
              <Heart size={20} strokeWidth={1.5} aria-hidden="true" />
              {saved > 0 && <span className="lx-badge" aria-hidden="true">{saved}</span>}
            </button>
            <button type="button" className="lx-icon-btn" onClick={() => setIsCartOpen(true)} aria-label={`Open bag (${count} items)`}>
              <ShoppingBag size={20} strokeWidth={1.5} aria-hidden="true" />
              {count > 0 && <span className="lx-badge" aria-hidden="true">{count}</span>}
            </button>
            <button type="button" className="lx-icon-btn lx-menu-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button type="button" className="lx-icon-btn lx-menu-btn" onClick={() => setMenu(true)} aria-label="Open menu" aria-expanded={menu}>
              <Menu size={22} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {menu && (
        <div className="lx-mobile-nav" role="dialog" aria-modal="true" aria-label="Menu">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="lx-tagline">A legacy of love, crafted forever</span>
            <button type="button" className="lx-icon-btn" onClick={() => setMenu(false)} aria-label="Close menu" autoFocus>
              <X size={24} aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Mobile">
            {NAV.map((n) => (
              <Link key={n.label} to={n.href} onClick={() => setMenu(false)}>{n.label}</Link>
            ))}
            <Link to="/faq" onClick={() => setMenu(false)}>FAQ</Link>
          </nav>
        </div>
      )}
    </>
  );
}
