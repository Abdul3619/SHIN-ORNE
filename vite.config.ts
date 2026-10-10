import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    ssr: {
      // Bundle every dependency into build/ssr/entry-server.js. On Vercel the server imports that file by a
      // computed path, so the function's file tracing never sees react, react-dom, react-router-dom, etc.;
      // left external they are missing at runtime and every page returns 500.
      noExternal: true,
    },
    server: {
      // Set DISABLE_HMR=true to turn off hot reload and file watching.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
