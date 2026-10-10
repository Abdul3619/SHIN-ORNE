import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Product } from '../types';

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string;
}

// Products rendered by the server for the first paint; the browser refreshes them once on load.
// Every section that shows products reads from here, so there is a single fetch and a single source.
const ProductsContext = createContext<ProductsState>({ products: [], loading: false, error: '' });

export function ProductsProvider({ initialProducts, children }: { initialProducts: Product[] | null; children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [loading, setLoading] = useState(initialProducts === null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only the storefront needs the catalogue; admin and policy pages skip the request.
    const path = window.location.pathname;
    if (path.startsWith('/admin') || path === '/design-preview') {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (!Array.isArray(data)) throw new Error('Unexpected response');
        setProducts(data);
        setError('');
      })
      .catch(() => {
        // Keep the server-rendered products if a refresh fails.
        if (!cancelled && initialProducts === null) {
          setError('Our collection could not be loaded right now. Please refresh the page or try again shortly.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ProductsContext.Provider value={{ products, loading, error }}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  return useContext(ProductsContext);
}
