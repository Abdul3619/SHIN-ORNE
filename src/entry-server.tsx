import {StrictMode} from 'react';
import {renderToString} from 'react-dom/server';
import {StaticRouter} from 'react-router-dom';
import App from './App';
import type {Product} from './types';

// products is null when the database could not be reached; the storefront then loads them in the browser.
export function render(url: string, products: Product[] | null) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App initialProducts={products} />
      </StaticRouter>
    </StrictMode>,
  );
}
