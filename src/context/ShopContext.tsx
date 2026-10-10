import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { COLLECTIONS, hasRingOptions, type CollectionSlug } from '../lib/catalogue';
import { useCart } from './CartContext';
import type { Product } from '../types';

export type Sort = 'featured' | 'low' | 'high';

export interface ShopFilter {
  collection: CollectionSlug | null;
  query: string;
  sort: Sort;
  max: number | null; // USD ceiling, set by the gift guide
  min: number | null;
}

interface ShopContextType {
  filter: ShopFilter;
  setFilter: (patch: Partial<ShopFilter>) => void;
  // Applies a filter and scrolls to the shop grid.
  browse: (patch: Partial<ShopFilter>) => void;
  reset: () => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  wishlistOpen: boolean;
  setWishlistOpen: (open: boolean) => void;
  // Rings and bridal pieces ask for size/engraving first; everything else goes straight to the bag.
  quickAdd: (product: Product) => void;
  optionsFor: Product | null;
  setOptionsFor: (product: Product | null) => void;
}

const EMPTY: ShopFilter = { collection: null, query: '', sort: 'featured', max: null, min: null };
// 'bridal' is also the id of the Bridal & Engagement section, so that hash scrolls to the section instead.
const SLUGS = COLLECTIONS.map((c) => c.slug).filter((s) => s !== 'bridal') as readonly string[];
const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [filter, setFilterState] = useState<ShopFilter>(EMPTY);
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [optionsFor, setOptionsFor] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const quickAdd = useCallback((product: Product) => (hasRingOptions(product) ? setOptionsFor(product) : addToCart(product)), [addToCart]);

  const setFilter = useCallback((patch: Partial<ShopFilter>) => setFilterState((f) => ({ ...f, ...patch })), []);
  const reset = useCallback(() => setFilterState(EMPTY), []);
  const browse = useCallback((patch: Partial<ShopFilter>) => {
    setFilterState({ ...EMPTY, ...patch });
    // Wait a frame so the grid has the new filter before scrolling to it.
    requestAnimationFrame(() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, []);

  // Collection links (/#rings, /#bridal, #shop-all ...) filter the shop; works for plain anchor clicks too.
  useEffect(() => {
    const apply = () => {
      const hash = window.location.hash.slice(1).toLowerCase();
      if (hash === 'shop-all') browse({});
      else if (SLUGS.includes(hash)) browse({ collection: hash as CollectionSlug });
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, [browse]);

  return (
    <ShopContext.Provider value={{ filter, setFilter, browse, reset, searchOpen, setSearchOpen, wishlistOpen, setWishlistOpen, quickAdd, optionsFor, setOptionsFor }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within ShopProvider');
  return ctx;
}
