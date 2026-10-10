/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Storefront from './pages/Storefront';
import AdminDashboard from './pages/AdminDashboard';
import AdminMagicLink from './pages/AdminMagicLink';
import Checkout from './pages/Checkout';
import DesignPreview from './pages/DesignPreview';
import InfoPage, { INFO_PAGES } from './pages/InfoPage';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { ProductsProvider } from './context/ProductsContext';
import { ThemeProvider } from './context/ThemeContext';
import { ShopProvider } from './context/ShopContext';
import type { Product } from './types';

// A route change starts at the top of the new page, unless the link points at an anchor on it.
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

// The router is supplied by the caller: BrowserRouter in the browser, StaticRouter on the server.
export default function App({ initialProducts = null }: { initialProducts?: Product[] | null }) {
  return (
    <ThemeProvider defaultTheme="dark">
    <ProductsProvider initialProducts={initialProducts}>
      <CurrencyProvider>
        <CartProvider>
          <ShopProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Storefront />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/magic/:token" element={<AdminMagicLink />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/design-preview" element={<DesignPreview />} />
            {INFO_PAGES.map((slug) => (
              <Route key={slug} path={`/${slug}`} element={<InfoPage slug={slug} />} />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </ShopProvider>
        </CartProvider>
      </CurrencyProvider>
    </ProductsProvider>
    </ThemeProvider>
  );
}
