import {StrictMode} from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import type {Product} from './types';
import './index.css';
import './luxe.css';

declare global {
  interface Window {
    __INITIAL_PRODUCTS__?: Product[];
  }
}

const rootElement = document.getElementById('root')!;
const app = (
  <StrictMode>
    <BrowserRouter>
      <App initialProducts={window.__INITIAL_PRODUCTS__ ?? null} />
    </BrowserRouter>
  </StrictMode>
);

// The storefront arrives server-rendered and is hydrated; the admin dashboard renders in the browser.
if (rootElement.firstElementChild) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
