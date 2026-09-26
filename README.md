# SHIN ORNE by CHARM AURA

Online store for handcrafted beads and jewelry, with an admin dashboard for products and orders.

## Stack

- React 19, React Router 7, Tailwind CSS 4, Motion (Vite)
- Express server: API, admin auth (JWT) and server-side rendering
- Supabase (Postgres) for products, orders, newsletter subscribers and settings

## How it works

- `/` is rendered on the server with the current products from the database, so anything saved in the admin dashboard shows up on the next page load. No rebuild is needed.
- `/admin` is the dashboard and renders in the browser. Admins can manage products, update order status and change the admin password.
- Checkout records the order (customer name, email, items) with the total calculated on the server from database prices. No online payment is taken; the shop follows up by email.

## Running locally

```bash
cp .env.example .env    # then set ADMIN_PASSWORD and JWT_SECRET
npm install
npm run dev             # http://localhost:3000
```

## Database

The schema lives in `supabase/migrations/`. Every table has row level security enabled with no policies,
and every `shop_*` function can only be executed by the service role, so the public anon key cannot read or
write anything. Only the server, holding `SUPABASE_SERVICE_ROLE_KEY`, can reach the data. Order totals are
calculated inside the database from product prices.

## Production (Vercel)

`vercel.json` builds the app and routes every non-static request to one serverless function
(`api/index.ts`), which runs the Express app: API, admin auth and server-rendered storefront. Static assets in
`dist/` are served by the CDN.

```bash
npm run build           # client -> dist/, SSR bundle + template + server -> build/
npm start               # run the production build locally (NODE_ENV=production node build/server.js)
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | Yes | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only key for the database. |
| `ADMIN_PASSWORD` | Yes, for admin | Creates the admin password on first use (at least 8 characters). Change it later in Admin > Settings; changing the variable afterwards has no effect. |
| `JWT_SECRET` | Yes, for admin | Signs admin sessions. Use a long random string. |
| `PORT` | No | Port for `npm start` / `npm run dev` (default 3000). |

Without the Supabase variables the storefront still loads but shows that products are unavailable; without
`ADMIN_PASSWORD` and `JWT_SECRET` admin login is disabled.
