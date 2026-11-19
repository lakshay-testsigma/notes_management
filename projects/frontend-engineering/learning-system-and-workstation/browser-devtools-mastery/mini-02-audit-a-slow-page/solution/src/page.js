// The HTML of the product page.

export function renderHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Trail Backpack</title>
  <link rel="preload" as="image" href="/hero.svg" fetchpriority="high">
  <script src="/analytics.js" defer></script>
  <script type="module" src="/app.js"></script>
  <style>
    body { font-family: sans-serif; max-width: 640px; margin: 2rem auto; }
    img { width: 100%; height: auto; }
  </style>
</head>
<body>
  <h1>Trail Backpack</h1>
  <img id="hero" src="/hero.svg" width="1200" height="600" alt="Trail Backpack" fetchpriority="high">
  <button id="add">Add to cart</button>
  <p id="status"></p>
  <h2>Reviews</h2>
  <ul id="reviews"><li>Loading...</li></ul>
</body>
</html>`;
}
