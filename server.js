const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const db = require("./db");
const AI = require("./aiEngine");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ---------- Auth ---------- */

app.post("/api/signup", (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ error: "name, phone and password are required" });
  }
  const existing = db.prepare("SELECT PhoneNumber FROM User WHERE PhoneNumber = ?").get(phone);
  if (existing) return res.status(409).json({ error: "An account with this phone number already exists" });

  const hash = bcrypt.hashSync(password, 10);
  db.prepare("INSERT INTO User (PhoneNumber, Name, PasswordHash) VALUES (?, ?, ?)").run(phone, name, hash);
  res.json({ name, phone });
});

app.post("/api/signin", (req, res) => {
  const { phone, password } = req.body;
  const user = db.prepare("SELECT * FROM User WHERE PhoneNumber = ?").get(phone);
  if (!user || !bcrypt.compareSync(password, user.PasswordHash)) {
    return res.status(401).json({ error: "Incorrect phone number or password" });
  }
  res.json({ name: user.Name, phone: user.PhoneNumber });
});

/* ---------- Allergies ---------- */

app.get("/api/allergies/:phone", (req, res) => {
  const rows = db.prepare("SELECT AllergyName FROM Allergy WHERE PhoneNumber = ?").all(req.params.phone);
  res.json(rows.map((r) => r.AllergyName));
});

app.post("/api/allergies/:phone", (req, res) => {
  const { allergyName } = req.body;
  if (!allergyName || !/^[a-zA-Z\s]+$/.test(allergyName)) {
    return res.status(400).json({ error: "Please enter letters only" });
  }
  db.prepare("INSERT INTO Allergy (PhoneNumber, AllergyName) VALUES (?, ?)").run(req.params.phone, allergyName.toLowerCase());
  res.json({ ok: true });
});

app.delete("/api/allergies/:phone/:allergyName", (req, res) => {
  db.prepare("DELETE FROM Allergy WHERE PhoneNumber = ? AND AllergyName = ?").run(req.params.phone, req.params.allergyName);
  res.json({ ok: true });
});

/* ---------- Scan / Analysis ---------- */

// Simulates the "capture" step: picks a product the way the real OCR
// pipeline eventually will, until ingredient-reading from a photo is wired in.
app.post("/api/scan", (req, res) => {
  const { category, imageValid } = req.body;
  if (imageValid === false) {
    return res.status(422).json({ error: "Unfortunately, a non-product image was uploaded. Please re-upload a product image." });
  }
  const product = AI.randomProduct(category);
  res.json(product);
});

app.get("/api/analyze/:productId", (req, res) => {
  const product = AI.findProduct(req.params.productId);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const allergies = db.prepare("SELECT AllergyName FROM Allergy WHERE PhoneNumber = ?").all(req.query.phone).map((r) => r.AllergyName);
  const result = AI.checkProductSafety(product, allergies);
  res.json({ product, ...result });
});

/* ---------- Alternatives ---------- */

app.get("/api/alternatives/:productId", (req, res) => {
  const product = AI.findProduct(req.params.productId);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const phone = req.query.phone;
  const allergies = phone
    ? db.prepare("SELECT AllergyName FROM Allergy WHERE PhoneNumber = ?").all(phone).map((r) => r.AllergyName)
    : [];
  const filterType = req.query.filter || "all";
  const alts = AI.getSuitableAlternatives(product, allergies, filterType);

  // Record the search, per the agreed "User searches for Alternative" relationship
  if (phone) {
    const stmt = db.prepare(
      `INSERT INTO "Alternative" (PhoneNumber, ProductID, SuggestedProductID, AlertPrice, IsOrganic) VALUES (?, ?, ?, ?, ?)`
    );
    alts.slice(0, 5).forEach((alt) => stmt.run(phone, product.id, alt.id, alt.price, alt.organic ? 1 : 0));
  }

  res.json(alts);
});

/* ---------- Product details ---------- */

app.get("/api/products/:id", (req, res) => {
  const product = AI.findProduct(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Glowtive running on http://localhost:${PORT} — open that URL for the app`));
