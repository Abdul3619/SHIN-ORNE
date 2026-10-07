/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import Storefront from './pages/Storefront';
import AdminDashboard from './pages/AdminDashboard';
import AdminMagicLink from './pages/AdminMagicLink';
import Checkout from './pages/Checkout';
import DesignPreview from './pages/DesignPreview';
import InfoPage, { INFO_PAGES } from './pages/InfoPage';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { ProductsProvider } from './context/ProductsContext';
import type { Product } from './types';

// The router is supplied by the caller: BrowserRouter in the browser, StaticRouter on the server.
export default function App({ initialProducts = null }: { initialProducts?: Product[] | null }) {
  return (
    <ProductsProvider initialProducts={initialProducts}>
      <CurrencyProvider>
        <CartProvider>
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
        </CartProvider>
      </CurrencyProvider>
    </ProductsProvider>
  );
}
