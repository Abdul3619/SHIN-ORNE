import {StrictMode} from 'react';
import {renderToString} from 'react-dom/server';
import {StaticRouter} from 'react-router-dom';
import App from './App';
import type {Product} from './types';

export function render(url: string, products: Product[]) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App initialProducts={products} />
      </StaticRouter>
    </StrictMode>,
  );
}
