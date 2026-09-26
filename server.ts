import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import type { ViteDevServer } from "vite";

const isProduction = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MIN_PASSWORD_LENGTH = 8;
// The password the original template seeded for every install. It is never accepted.
const INSECURE_DEFAULT_PASSWORD = "admin123";
const ORDER_STATUSES = ["Pending", "Shipped", "Delivered"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LOGIN_FAILURES = 5;
const LOGIN_WINDOW_SECONDS = 15 * 60;

// All data lives in Supabase (Postgres). The service role key stays on the server; tables have RLS enabled
// with no policies and every shop_* function is executable only by service_role (see supabase/migrations).
const db =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;

if (!db) console.warn("The store is offline: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
if (!JWT_SECRET) console.warn("Admin login is disabled: set JWT_SECRET to enable it.");

class ServiceUnavailableError extends Error {}

async function rpc<T = any>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  if (!db) throw new ServiceUnavailableError("Database is not configured");
  const { data, error } = await db.rpc(fn, args);
  if (error) throw Object.assign(new Error(error.message), { code: error.code });
  return data as T;
}

interface ProductRow {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

const listProducts = () => rpc<ProductRow[]>("shop_list_products");

// --- Password helpers ---
function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

function verifyPassword(password: string, stored: string) {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

function isAcceptablePassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= MIN_PASSWORD_LENGTH && password !== INSECURE_DEFAULT_PASSWORD;
}

async function getAdminAuth() {
  const rows = await rpc<{ password_hash: string | null; session_version: string }[]>("shop_get_admin_auth");
  return rows[0] ?? { password_hash: null, session_version: "0" };
}

// On first use, create the admin password from ADMIN_PASSWORD. An existing password is never overwritten,
// so a password changed in the dashboard survives redeploys.
let adminSeeded: Promise<void> | null = null;
function ensureAdminSeeded() {
  adminSeeded ??= (async () => {
    const auth = await getAdminAuth();
    if (auth.password_hash) return;
    if (!isAcceptablePassword(process.env.ADMIN_PASSWORD)) {
      console.warn(`Admin login is disabled: set ADMIN_PASSWORD (at least ${MIN_PASSWORD_LENGTH} characters) to enable it.`);
      return;
    }
    await rpc("shop_seed_admin_password", { p_hash: hashPassword(process.env.ADMIN_PASSWORD) });
  })().catch((error) => {
    adminSeeded = null; // retry on the next request
    throw error;
  });
  return adminSeeded;
}

function issueToken(sessionVersion: string) {
  return jwt.sign({ role: "admin", sv: sessionVersion }, JWT_SECRET!, { expiresIn: "12h", algorithm: "HS256" });
}

// --- Request validation ---
const parseId = (value: string) => (/^\d+$/.test(value) ? Number(value) : null);

function parseProduct(body: any): { value: Omit<ProductRow, "id"> } | { error: string } {
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const category = typeof body?.category === "string" ? body.category.trim() : "";
  const image = typeof body?.image === "string" ? body.image.trim() : "";
  const price = typeof body?.price === "number" ? body.price : Number.NaN;

  if (!name || name.length > 120) return { error: "Enter a product name (up to 120 characters)." };
  if (!Number.isFinite(price) || price <= 0 || price > 1_000_000) return { error: "Enter a price greater than 0." };
  if (!category || category.length > 60) return { error: "Enter a category (up to 60 characters)." };
  try {
    const url = new URL(image);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("bad protocol");
  } catch {
    return { error: "Enter a valid image URL starting with http:// or https://." };
  }
  return { value: { name, price: Math.round(price * 100) / 100, image, category } };
}

// Embeds data in an inline <script> without letting product text close the tag.
const serializeForScript = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

type Handler = (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<unknown>;
// Forwards rejected promises to the error handler (Express 4 does not do this by itself).
const asyncRoute = (handler: Handler) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
  handler(req, res, next).catch(next);

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use(express.json({ limit: "100kb" }));

// --- Auth Middleware & Routes ---
const authenticateToken = asyncRoute(async (req, res, next) => {
  if (!JWT_SECRET) return res.status(503).json({ error: "Admin access is not configured on this server." });

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  let payload: jwt.JwtPayload | string;
  try {
    payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    return res.status(401).json({ error: "Your session has expired. Please log in again." });
  }
  if (typeof payload !== "object" || payload.role !== "admin") {
    return res.status(401).json({ error: "Your session has expired. Please log in again." });
  }
  // Tokens issued before the last password change are no longer valid.
  const { session_version } = await getAdminAuth();
  if (payload.sv !== session_version) {
    return res.status(401).json({ error: "Your session has expired. Please log in again." });
  }
  next();
});

app.post("/api/admin/login", asyncRoute(async (req, res) => {
  if (!JWT_SECRET) return res.status(503).json({ error: "Admin login is not configured on this server." });
  await ensureAdminSeeded();
  const { password_hash, session_version } = await getAdminAuth();
  if (!password_hash) return res.status(503).json({ error: "Admin login is not configured on this server." });

  const ip = req.ip || "unknown";
  if (await rpc<boolean>("shop_login_blocked", { p_ip: ip, p_max: MAX_LOGIN_FAILURES })) {
    return res.status(429).json({ error: "Too many failed attempts. Please try again in 15 minutes." });
  }

  const { password } = req.body ?? {};
  if (typeof password === "string" && verifyPassword(password, password_hash)) {
    await rpc("shop_clear_login_failures", { p_ip: ip });
    res.json({ token: issueToken(session_version) });
  } else {
    await rpc("shop_record_login_failure", { p_ip: ip, p_window_seconds: LOGIN_WINDOW_SECONDS });
    res.status(401).json({ error: 'Invalid credentials' });
  }
}));

app.post("/api/admin/change-password", authenticateToken, asyncRoute(async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  const { password_hash } = await getAdminAuth();

  if (!password_hash || typeof currentPassword !== "string" || !verifyPassword(currentPassword, password_hash)) {
    return res.status(401).json({ error: 'Incorrect current password' });
  }
  if (!isAcceptablePassword(newPassword)) {
    return res.status(400).json({ error: `The new password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
  }
  if (newPassword === currentPassword) {
    return res.status(400).json({ error: "The new password must be different from the current one." });
  }

  const sessionVersion = crypto.randomBytes(16).toString("hex");
  await rpc("shop_set_admin_password", { p_hash: hashPassword(newPassword), p_session_version: sessionVersion });
  // Other sessions are signed out; this one continues with a fresh token.
  res.json({ success: true, token: issueToken(sessionVersion) });
}));

// --- API Routes ---

// Products
app.get("/api/products", asyncRoute(async (req, res) => {
  res.json(await listProducts());
}));

app.post("/api/products", authenticateToken, asyncRoute(async (req, res) => {
  const parsed = parseProduct(req.body);
  if ("error" in parsed) return res.status(400).json({ error: parsed.error });
  const { name, price, image, category } = parsed.value;
  const rows = await rpc<ProductRow[]>("shop_create_product", { p_name: name, p_price: price, p_image: image, p_category: category });
  res.status(201).json(rows[0]);
}));

app.put("/api/products/:id", authenticateToken, asyncRoute(async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(404).json({ error: "Product not found" });
  const parsed = parseProduct(req.body);
  if ("error" in parsed) return res.status(400).json({ error: parsed.error });
  const { name, price, image, category } = parsed.value;
  const updated = await rpc<boolean>("shop_update_product", { p_id: id, p_name: name, p_price: price, p_image: image, p_category: category });
  if (!updated) return res.status(404).json({ error: "Product not found" });
  res.json({ success: true });
}));

app.delete("/api/products/:id", authenticateToken, asyncRoute(async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(404).json({ error: "Product not found" });
  const deleted = await rpc<boolean>("shop_delete_product", { p_id: id });
  if (!deleted) return res.status(404).json({ error: "Product not found" });
  res.json({ success: true });
}));

// Orders
app.get("/api/orders", authenticateToken, asyncRoute(async (req, res) => {
  res.json(await rpc("shop_list_orders"));
}));

app.post("/api/orders", asyncRoute(async (req, res) => {
  const { customer_name, customer_email, items } = req.body ?? {};
  const name = typeof customer_name === "string" ? customer_name.trim() : "";
  const email = typeof customer_email === "string" ? customer_email.trim() : "";

  if (!name || name.length > 120) return res.status(400).json({ error: "Please enter your name." });
  if (!EMAIL_PATTERN.test(email) || email.length > 254) return res.status(400).json({ error: "Please enter a valid email address." });
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return res.status(400).json({ error: "Your cart is empty." });
  }
  for (const item of items) {
    const quantity = item?.quantity;
    if (!Number.isInteger(item?.id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return res.status(400).json({ error: "Your cart contains an invalid item." });
    }
  }

  try {
    // The database prices every line from the products table; the browser's prices are never used.
    const rows = await rpc<{ id: number; total: number }[]>("shop_create_order", {
      p_customer_name: name,
      p_customer_email: email,
      p_items: items.map((item: any) => ({ id: item.id, quantity: item.quantity })),
    });
    res.status(201).json(rows[0]);
  } catch (error: any) {
    if (error?.message === "unavailable_item") {
      return res.status(409).json({ error: "Some items in your cart are no longer available. Please remove them and try again." });
    }
    if (error?.message === "invalid_item") return res.status(400).json({ error: "Your cart contains an invalid item." });
    throw error;
  }
}));

app.put("/api/orders/:id/status", authenticateToken, asyncRoute(async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(404).json({ error: "Order not found" });
  const { status } = req.body ?? {};
  if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ error: "Invalid order status" });
  const updated = await rpc<boolean>("shop_update_order_status", { p_id: id, p_status: status });
  if (!updated) return res.status(404).json({ error: "Order not found" });
  res.json({ success: true });
}));

// Newsletter
app.post("/api/newsletter", asyncRoute(async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  if (!EMAIL_PATTERN.test(email) || email.length > 254) return res.status(400).json({ error: "Please enter a valid email address." });
  await rpc("shop_subscribe", { p_email: email });
  res.status(201).json({ success: true });
}));

app.get("/api/subscribers", authenticateToken, asyncRoute(async (req, res) => {
  res.json(await rpc("shop_list_subscribers"));
}));

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// --- Pages ---
type Render = (url: string, products: ProductRow[] | null) => string;

// In production the HTML template lives in build/ (moved out of dist/ at build time, so the host can never
// serve it directly as an empty shell) and the SSR bundle in build/ssr/.
let productionPage: Promise<{ template: string; render: Render }> | null = null;
function loadProductionPage() {
  productionPage ??= (async () => {
    const template = fs.readFileSync(path.join(process.cwd(), "build", "template.html"), "utf-8");
    const ssrEntry = path.join(process.cwd(), "build", "ssr", "entry-server.js");
    const { render } = await import(pathToFileURL(ssrEntry).href);
    return { template, render };
  })();
  return productionPage;
}

let viteServer: Promise<ViteDevServer> | null = null;
function getVite() {
  viteServer ??= import("vite").then(({ createServer }) =>
    createServer({ server: { middlewareMode: true }, appType: "custom" })
  );
  return viteServer;
}

if (!isProduction) {
  app.use(asyncRoute(async (req, res, next) => (await getVite()).middlewares(req, res, next)));
} else if (!process.env.VERCEL) {
  // On Vercel the CDN serves dist/; elsewhere Express does.
  app.use(express.static(path.join(process.cwd(), "dist"), { index: false }));
}

const loadPage = async (url: string): Promise<{ template: string; render: Render }> => {
  if (!isProduction) {
    const vite = await getVite();
    const template = await vite.transformIndexHtml(url, fs.readFileSync(path.resolve("index.html"), "utf-8"));
    const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");
    return { template, render };
  }
  return loadProductionPage();
};

// The storefront is rendered on the server with the current products, so admin changes show up immediately.
app.get("/", asyncRoute(async (req, res) => {
  const { template, render } = await loadPage(req.originalUrl);
  let products: ProductRow[] | null = null;
  try {
    products = await listProducts();
  } catch (error) {
    // Still serve the page; the browser shows its "could not load" message and retries on refresh.
    console.error("[SSR] Could not load products:", error);
  }
  const html = template
    .replace("<!--app-html-->", render(req.originalUrl, products))
    .replace("<!--app-state-->", products ? `<script>window.__INITIAL_PRODUCTS__=${serializeForScript(products)}</script>` : "");
  res.status(200).set({ "Content-Type": "text/html", "Cache-Control": "no-store" }).send(html);
}));

// The admin dashboard renders in the browser only.
app.get("/admin", asyncRoute(async (req, res) => {
  const { template } = await loadPage(req.originalUrl);
  const html = template
    .replace("<!--app-html-->", "")
    .replace("<!--app-state-->", "")
    .replace('<meta name="robots" content="index, follow" />', '<meta name="robots" content="noindex, nofollow" />');
  res.status(200).set({ "Content-Type": "text/html", "Cache-Control": "no-store" }).send(html);
}));

// Unknown pages go back to the storefront.
app.get("*", (req, res) => {
  if (path.extname(req.path)) return res.status(404).send("Not found");
  res.redirect(302, "/");
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error?.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON body" });
  if (error?.type === "entity.too.large") return res.status(413).json({ error: "Request body too large" });
  if (error instanceof ServiceUnavailableError) {
    if (req.path.startsWith("/api")) return res.status(503).json({ error: "The store is temporarily unavailable." });
    return res.status(503).send("The store is temporarily unavailable. Please try again later.");
  }
  console.error(error);
  if (req.path.startsWith("/api")) return res.status(500).json({ error: "Internal server error" });
  res.status(500).send("Something went wrong. Please try again later.");
});

// On Vercel the app is exported as a serverless function (api/index.ts) instead of listening on a port.
if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
