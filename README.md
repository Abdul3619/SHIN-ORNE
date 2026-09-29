# SHIN ORNE by CHARM AURA

I built this online store for Shin Orne by Charm Aura, a handcrafted beads and jewelry brand. Customers browse and order from the shop, and the owner manages products and orders from an admin dashboard.

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

## Checkout (demo)

`/checkout` has a card form plus Google Pay, Apple Pay and PayPal buttons. **Payment is mocked**: nothing is charged and card details never leave the browser. Orders are still recorded (priced on the server) and show in the admin dashboard as Pending. Ring size and engraving are UI only for now; they appear in the cart and at checkout but are not saved with the order. See the comment at the top of `src/pages/Checkout.tsx` for what a real payment integration needs.

## Policy pages

`/privacy`, `/terms`, `/shipping-returns`, `/size-guide` and `/faq` are generic templates (see `src/pages/InfoPage.tsx`) and need legal review before the store trades.

## Troubleshooting the live site

`GET /api/health` reports `{"database": "ok" | "not_configured" | "unreachable", "adminLogin": true | false}` without exposing any values. `unreachable` usually means the Supabase project is paused (free projects pause after a week of inactivity); restore it from the Supabase dashboard.
