# SHIN ORNE by CHARM AURA

Online store for handcrafted beads and jewelry, with an admin dashboard for products and orders.

## Stack

- React 19, React Router 7, Tailwind CSS 4, Motion (Vite)
- Express server: API, admin auth (JWT) and server-side rendering
- SQLite (better-sqlite3) for products, orders, newsletter subscribers and settings

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

## Production

```bash
npm run build           # client -> dist/, SSR bundle + server -> build/
npm start               # NODE_ENV=production node build/server.js
```

This app needs a **persistent Node.js host** (for example Render, Railway, Fly.io or a VPS) with a persistent disk for the SQLite file. Static hosting cannot run the API or keep the database.

| Variable | Required | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | Yes, for admin | Creates the admin password on first start (at least 8 characters). Change it later in Admin > Settings. |
| `JWT_SECRET` | Yes, for admin | Signs admin sessions. Use a long random string. |
| `DATABASE_PATH` | No | Location of the SQLite file (default `database.sqlite`). Point it at a persistent disk. |
| `PORT` | No | Port to listen on (default 3000). |

Without `ADMIN_PASSWORD` and `JWT_SECRET` the store still works, but admin login is disabled.
