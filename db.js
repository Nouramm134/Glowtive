// db.js — real SQLite database, schema matches the team's agreed ER
// diagram: User, Allergy, Alternative. Product data is NOT stored locally
// (per the team's decision) — it's looked up live from the catalog module.

const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "glowtive.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS User (
    PhoneNumber TEXT PRIMARY KEY,
    Name        TEXT NOT NULL,
    PasswordHash TEXT NOT NULL,
    CreatedAt   TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS Allergy (
    AllergyID     INTEGER PRIMARY KEY AUTOINCREMENT,
    PhoneNumber   TEXT NOT NULL,
    AllergyName   TEXT NOT NULL,
    FOREIGN KEY (PhoneNumber) REFERENCES User(PhoneNumber) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "Alternative" (
    AlternativeID     INTEGER PRIMARY KEY AUTOINCREMENT,
    PhoneNumber       TEXT NOT NULL,      -- User who searched (real FK)
    ProductID         TEXT NOT NULL,      -- original product (not a local FK: Product isn't stored)
    SuggestedProductID TEXT NOT NULL,     -- substitute product
    AlertPrice        REAL,
    IsOrganic          INTEGER,
    CreatedAt          TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PhoneNumber) REFERENCES User(PhoneNumber) ON DELETE CASCADE
  );
`);

module.exports = db;
