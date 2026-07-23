/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Storefront from './pages/Storefront';
import AdminDashboard from './pages/AdminDashboard';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <CurrencyProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Storefront />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Router>
      </CartProvider>
    </CurrencyProvider>
  );
}

