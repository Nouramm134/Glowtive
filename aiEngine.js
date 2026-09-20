// aiEngine.js — mirrors the AIEngine class from the agreed class diagram:
// AnalyzeIngredients, MatchAllergens, CheckProductSafety, GetSuitableAlternatives.
// This is real, running server-side logic (not a mock) — it's just
// rule-based rather than a trained ML/OCR model. See README for how to
// swap in a real vision model for ingredient-reading later.

const PRODUCTS = require("./products");

function analyzeIngredients(product) {
  return product.ingredients;
}

function matchAllergens(ingredients, allergyList) {
  return ingredients.find((ing) => allergyList.includes(ing)) || null;
}

function checkProductSafety(product, allergyList) {
  const flagged = matchAllergens(analyzeIngredients(product), allergyList);
  return { safe: !flagged, flagged };
}

function getSuitableAlternatives(product, allergyList, filterType) {
  return PRODUCTS.filter((p) => {
    if (p.id === product.id) return false;
    if (p.category !== product.category) return false;
    if (filterType === "organic" && !p.organic) return false;
    return checkProductSafety(p, allergyList).safe;
  }).sort((a, b) => (filterType === "cheapest" ? a.price - b.price : 0));
}

function findProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function randomProduct(category) {
  const pool = PRODUCTS.filter((p) => p.category === category);
  const list = pool.length ? pool : PRODUCTS;
  return list[Math.floor(Math.random() * list.length)];
}

module.exports = {
  PRODUCTS,
  analyzeIngredients,
  matchAllergens,
  checkProductSafety,
  getSuitableAlternatives,
  findProduct,
  randomProduct,
};
