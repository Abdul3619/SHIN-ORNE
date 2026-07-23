import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";

const db = new Database("database.sqlite");

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
`);

// Seed default admin password if not exists
const pwStmt = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'");
const pwRow = pwStmt.get() as { value: string } | undefined;
if (!pwRow) {
  db.prepare("INSERT INTO settings (key, value) VALUES ('admin_password', ?)").run(process.env.ADMIN_PASSWORD || 'admin123');
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Auth Middleware & Routes ---
  const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      next();
    });
  };

  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    
    const row = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get() as { value: string } | undefined;
    const adminPassword = row ? row.value : (process.env.ADMIN_PASSWORD || 'admin123');
    
    if (password === adminPassword) {
      const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  app.post("/api/admin/change-password", authenticateToken, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    const row = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get() as { value: string } | undefined;
    const adminPassword = row ? row.value : (process.env.ADMIN_PASSWORD || 'admin123');

    if (currentPassword !== adminPassword) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    try {
      db.prepare("UPDATE settings SET value = ? WHERE key = 'admin_password'").run(newPassword);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update password' });
    }
  });

  // --- API Routes ---

  // Products
  app.get("/api/products", (req, res) => {
    try {
      const products = db.prepare("SELECT * FROM products").all();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", authenticateToken, (req, res) => {
    const { name, price, image, category } = req.body;
    try {
      const info = db.prepare("INSERT INTO products (name, price, image, category) VALUES (?, ?, ?, ?)").run(name, price, image, category);
      res.json({ id: info.lastInsertRowid, name, price, image, category });
    } catch (error) {
      res.status(500).json({ error: "Failed to add product" });
    }
  });

  app.put("/api/products/:id", authenticateToken, (req, res) => {
    const { name, price, image, category } = req.body;
    try {
      db.prepare("UPDATE products SET name = ?, price = ?, image = ?, category = ? WHERE id = ?").run(name, price, image, category, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", authenticateToken, (req, res) => {
    try {
      db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Orders
  app.get("/api/orders", authenticateToken, (req, res) => {
    try {
      const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", (req, res) => {
    const { customer_name, customer_email, total } = req.body;
    try {
      const info = db.prepare("INSERT INTO orders (customer_name, customer_email, total, status) VALUES (?, ?, ?, ?)").run(customer_name, customer_email, total, 'Pending');
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id/status", authenticateToken, (req, res) => {
    const { status } = req.body;
    try {
      db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
