import type { ReactNode } from 'react';
import { useShop } from '../../context/ShopContext';
import { useCart } from '../../context/CartContext';
import SilkFlow from './SilkFlow';
import Header from './Header';
import BagDrawer from './BagDrawer';
import WishlistDrawer from './WishlistDrawer';
import SearchOverlay from './SearchOverlay';
import RingOptionsDialog from '../RingOptionsDialog';
import Footer from '../Footer';

// Page frame shared by the storefront, checkout and policy pages: atmosphere, flowing ribbon, header,
// footer and the overlays (bag, wishlist, search, ring options) so they work on every page.
export default function Shell({ children, solidHeader = false, ribbon = true }: { children: ReactNode; solidHeader?: boolean; ribbon?: boolean }) {
  const { optionsFor, setOptionsFor } = useShop();
  const { addToCart } = useCart();
  return (
    <div className="lx">
      <div className="lx-atmos" aria-hidden="true" />
      {ribbon && <div className="lx-flow"><SilkFlow /></div>}
      <Header solid={solidHeader} />
      <main className="lx-main">{children}</main>
      <Footer />
      <BagDrawer />
      <WishlistDrawer />
      <SearchOverlay />
      {optionsFor && (
        <RingOptionsDialog
          product={optionsFor}
          onClose={() => setOptionsFor(null)}
          onAdd={(options) => { addToCart(optionsFor, options); setOptionsFor(null); }}
        />
      )}
    </div>
  );
}
