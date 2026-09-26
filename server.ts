import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { pathToFileURL } from "url";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import type { ViteDevServer } from "vite";

const isProduction = process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const MIN_PASSWORD_LENGTH = 8;
// The password the original template seeded for every install. It is never accepted.
const INSECURE_DEFAULT_PASSWORD = "admin123";
const ORDER_STATUSES = ["Pending", "Shipped", "Delivered"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const db = new Database(process.env.DATABASE_PATH || "database.sqlite");
db.pragma("journal_mode = WAL");

// Initialize DB schema
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    image TEXT,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT,
    customer_email TEXT,
    total REAL,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const orderColumns = db.prepare("PRAGMA table_info(orders)").all() as { name: string }[];
if (!orderColumns.some((column) => column.name === "items")) {
  db.exec("ALTER TABLE orders ADD COLUMN items TEXT");
}

// --- Settings & password helpers ---
const getSetting = (key: string) =>
  (db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined)?.value;
const setSetting = (key: string, value: string) =>
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, value);

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

// Upgrade passwords stored in plain text by earlier versions. The template default is dropped rather than kept.
const storedPassword = getSetting("admin_password");
if (storedPassword && !storedPassword.startsWith("scrypt$")) {
  if (storedPassword === INSECURE_DEFAULT_PASSWORD) {
    db.prepare("DELETE FROM settings WHERE key = 'admin_password'").run();
  } else {
    setSetting("admin_password", hashPassword(storedPassword));
  }
}

// Seed the admin password from the environment on first run.
if (!getSetting("admin_password")) {
  if (isAcceptablePassword(process.env.ADMIN_PASSWORD)) {
    setSetting("admin_password", hashPassword(process.env.ADMIN_PASSWORD));
  } else {
    console.warn(`Admin login is disabled: set ADMIN_PASSWORD (at least ${MIN_PASSWORD_LENGTH} characters) to enable it.`);
  }
}
if (!JWT_SECRET) {
  console.warn("Admin login is disabled: set JWT_SECRET to enable it.");
}

// Seed initial products if empty
const stmt = db.prepare("SELECT COUNT(*) as count FROM products");
const { count } = stmt.get() as { count: number };

if (count === 0) {
  const insert = db.prepare("INSERT INTO products (name, price, image, category) VALUES (?, ?, ?, ?)");
  const initialProducts = [
    ['Golden Aura Necklace', 129.00, 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&q=80&w=800', 'Necklaces'],
    ['Emerald Bead Bracelet', 89.00, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800', 'Bracelets'],
    ['Pearl Drop Earrings', 149.00, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800', 'Earrings'],
    ['Sapphire Charm Set', 199.00, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800', 'Sets'],
    ['Ruby Pendant', 210.00, 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=800', 'Necklaces'],
    ['Silver Bead Chain', 75.00, 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&q=80&w=801', 'Bracelets'],
    ['Crystal Studs', 59.00, 'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?auto=format&fit=crop&q=80&w=800', 'Earrings'],
    ['Amethyst Ring', 115.00, 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800', 'Rings'],
  ];
  for (const p of initialProducts) {
    insert.run(p);
  }
}

interface ProductRow {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

const listProducts = () =>
  db.prepare("SELECT id, name, price, image, category FROM products ORDER BY id").all() as ProductRow[];

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

// --- Login rate limiting (per client IP, in memory) ---
const MAX_LOGIN_FAILURES = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const loginFailures = new Map<string, { count: number; resetAt: number }>();

function isLoginBlocked(ip: string) {
  const entry = loginFailures.get(ip);
  if (!entry) return false;
  if (entry.resetAt < Date.now()) {
    loginFailures.delete(ip);
    return false;
  }
  return entry.count >= MAX_LOGIN_FAILURES;
}

function recordLoginFailure(ip: string) {
  const entry = loginFailures.get(ip);
  if (!entry || entry.resetAt < Date.now()) {
    loginFailures.set(ip, { count: 1, resetAt: Date.now() + LOGIN_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

// Changing the password rotates the session version, which signs out every existing session.
const currentSessionVersion = () => getSetting("session_version") || "0";

function issueToken() {
  return jwt.sign({ role: "admin", sv: currentSessionVersion() }, JWT_SECRET!, { expiresIn: "12h", algorithm: "HS256" });
}

// Embeds data in an inline <script> without letting product text close the tag.
const serializeForScript = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

async function startServer() {
  const app = express();

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
  const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!JWT_SECRET) return res.status(503).json({ error: "Admin access is not configured on this server." });

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }, (err, payload) => {
      if (err || typeof payload !== "object" || payload.role !== "admin") {
        return res.status(401).json({ error: "Your session has expired. Please log in again." });
      }
      // Tokens issued before the last password change are no longer valid.
      if (payload.sv !== currentSessionVersion()) {
        return res.status(401).json({ error: "Your session has expired. Please log in again." });
      }
      next();
    });
  };

  app.post("/api/admin/login", (req, res) => {
    const storedHash = getSetting("admin_password");
    if (!JWT_SECRET || !storedHash) {
      return res.status(503).json({ error: "Admin login is not configured on this server." });
    }

    const ip = req.ip || "unknown";
    if (isLoginBlocked(ip)) {
      return res.status(429).json({ error: "Too many failed attempts. Please try again in 15 minutes." });
    }

    const { password } = req.body ?? {};
    if (typeof password === "string" && verifyPassword(password, storedHash)) {
      loginFailures.delete(ip);
      res.json({ token: issueToken() });
    } else {
      recordLoginFailure(ip);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  app.post("/api/admin/change-password", authenticateToken, (req, res) => {
    const { currentPassword, newPassword } = req.body ?? {};
    const storedHash = getSetting("admin_password");

    if (!storedHash || typeof currentPassword !== "string" || !verifyPassword(currentPassword, storedHash)) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }
    if (!isAcceptablePassword(newPassword)) {
      return res.status(400).json({ error: `The new password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    }
    if (newPassword === currentPassword) {
      return res.status(400).json({ error: "The new password must be different from the current one." });
    }

    try {
      setSetting("admin_password", hashPassword(newPassword));
      setSetting("session_version", crypto.randomBytes(16).toString("hex"));
      // Other sessions are signed out; this one continues with a fresh token.
      res.json({ success: true, token: issueToken() });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update password' });
    }
  });

  // --- API Routes ---

  // Products
  app.get("/api/products", (req, res) => {
    try {
      res.json(listProducts());
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", authenticateToken, (req, res) => {
    const parsed = parseProduct(req.body);
    if ("error" in parsed) return res.status(400).json({ error: parsed.error });
    const { name, price, image, category } = parsed.value;
    try {
      const info = db.prepare("INSERT INTO products (name, price, image, category) VALUES (?, ?, ?, ?)").run(name, price, image, category);
      res.status(201).json({ id: Number(info.lastInsertRowid), name, price, image, category });
    } catch (error) {
      res.status(500).json({ error: "Failed to add product" });
    }
  });

  app.put("/api/products/:id", authenticateToken, (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return res.status(404).json({ error: "Product not found" });
    const parsed = parseProduct(req.body);
    if ("error" in parsed) return res.status(400).json({ error: parsed.error });
    const { name, price, image, category } = parsed.value;
    try {
      const info = db.prepare("UPDATE products SET name = ?, price = ?, image = ?, category = ? WHERE id = ?").run(name, price, image, category, id);
      if (info.changes === 0) return res.status(404).json({ error: "Product not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", authenticateToken, (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return res.status(404).json({ error: "Product not found" });
    try {
      const info = db.prepare("DELETE FROM products WHERE id = ?").run(id);
      if (info.changes === 0) return res.status(404).json({ error: "Product not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Orders
  app.get("/api/orders", authenticateToken, (req, res) => {
    try {
      const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC, id DESC").all() as { items: string | null }[];
      res.json(orders.map((order) => ({ ...order, items: order.items ? JSON.parse(order.items) : [] })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", (req, res) => {
    const { customer_name, customer_email, items } = req.body ?? {};
    const name = typeof customer_name === "string" ? customer_name.trim() : "";
    const email = typeof customer_email === "string" ? customer_email.trim() : "";

    if (!name || name.length > 120) return res.status(400).json({ error: "Please enter your name." });
    if (!EMAIL_PATTERN.test(email) || email.length > 254) return res.status(400).json({ error: "Please enter a valid email address." });
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return res.status(400).json({ error: "Your cart is empty." });
    }

    // Prices always come from the database, never from the browser.
    const findProduct = db.prepare("SELECT id, name, price FROM products WHERE id = ?");
    const lines: { id: number; name: string; price: number; quantity: number }[] = [];
    for (const item of items) {
      const quantity = item?.quantity;
      if (!Number.isInteger(item?.id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return res.status(400).json({ error: "Your cart contains an invalid item." });
      }
      const product = findProduct.get(item.id) as { id: number; name: string; price: number } | undefined;
      if (!product) {
        return res.status(409).json({ error: "Some items in your cart are no longer available. Please remove them and try again." });
      }
      lines.push({ id: product.id, name: product.name, price: product.price, quantity });
    }
    const total = Math.round(lines.reduce((sum, line) => sum + line.price * line.quantity, 0) * 100) / 100;

    try {
      const info = db
        .prepare("INSERT INTO orders (customer_name, customer_email, total, status, items) VALUES (?, ?, ?, ?, ?)")
        .run(name, email, total, 'Pending', JSON.stringify(lines));
      res.status(201).json({ id: Number(info.lastInsertRowid), total });
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id/status", authenticateToken, (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return res.status(404).json({ error: "Order not found" });
    const { status } = req.body ?? {};
    if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ error: "Invalid order status" });
    try {
      const info = db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
      if (info.changes === 0) return res.status(404).json({ error: "Order not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Newsletter
  app.post("/api/newsletter", (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    if (!EMAIL_PATTERN.test(email) || email.length > 254) return res.status(400).json({ error: "Please enter a valid email address." });
    try {
      db.prepare("INSERT OR IGNORE INTO subscribers (email) VALUES (?)").run(email.toLowerCase());
      res.status(201).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  app.get("/api/subscribers", authenticateToken, (req, res) => {
    try {
      res.json(db.prepare("SELECT email, created_at FROM subscribers ORDER BY created_at DESC").all());
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscribers" });
    }
  });

  app.use("/api", (req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // --- Pages ---
  type Render = (url: string, products: ProductRow[]) => string;
  let vite: ViteDevServer | undefined;
  let productionTemplate = "";
  let productionRender: Render | undefined;

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    productionTemplate = fs.readFileSync(path.join(distPath, "index.html"), "utf-8");
    const ssrEntry = path.join(process.cwd(), "build", "ssr", "entry-server.js");
    productionRender = (await import(pathToFileURL(ssrEntry).href)).render;
    app.get("/index.html", (req, res) => res.redirect(301, "/"));
    app.use(express.static(distPath, { index: false }));
  }

  const loadPage = async (url: string): Promise<{ template: string; render: Render }> => {
    if (vite) {
      const template = await vite.transformIndexHtml(url, fs.readFileSync(path.resolve("index.html"), "utf-8"));
      const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");
      return { template, render };
    }
    return { template: productionTemplate, render: productionRender! };
  };

  // The storefront is rendered on the server with the current products, so admin changes show up immediately.
  app.get("/", async (req, res, next) => {
    try {
      const { template, render } = await loadPage(req.originalUrl);
      const products = listProducts();
      const html = template
        .replace("<!--app-html-->", render(req.originalUrl, products))
        .replace("<!--app-state-->", `<script>window.__INITIAL_PRODUCTS__=${serializeForScript(products)}</script>`);
      res.status(200).set({ "Content-Type": "text/html" }).send(html);
    } catch (error) {
      vite?.ssrFixStacktrace(error as Error);
      next(error);
    }
  });

  // The admin dashboard renders in the browser only.
  app.get("/admin", async (req, res, next) => {
    try {
      const { template } = await loadPage(req.originalUrl);
      const html = template
        .replace("<!--app-html-->", "")
        .replace("<!--app-state-->", "")
        .replace('<meta name="robots" content="index, follow" />', '<meta name="robots" content="noindex, nofollow" />');
      res.status(200).set({ "Content-Type": "text/html", "Cache-Control": "no-store" }).send(html);
    } catch (error) {
      next(error);
    }
  });

  // Unknown pages go back to the storefront.
  app.get("*", (req, res) => {
    if (path.extname(req.path)) return res.status(404).send("Not found");
    res.redirect(302, "/");
  });

  app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (error?.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON body" });
    if (error?.type === "entity.too.large") return res.status(413).json({ error: "Request body too large" });
    console.error(error);
    if (req.path.startsWith("/api")) return res.status(500).json({ error: "Internal server error" });
    res.status(500).send("Something went wrong. Please try again later.");
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
