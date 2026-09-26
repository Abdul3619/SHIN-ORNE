import { createContext, useContext, ReactNode } from 'react';
import type { Product } from '../types';

// Products rendered by the server for the first paint; the storefront refreshes them in the browser.
const ProductsContext = createContext<Product[] | null>(null);

export function ProductsProvider({ initialProducts, children }: { initialProducts: Product[] | null; children: ReactNode }) {
  return <ProductsContext.Provider value={initialProducts}>{children}</ProductsContext.Provider>;
}

export function useInitialProducts() {
  return useContext(ProductsContext);
}
