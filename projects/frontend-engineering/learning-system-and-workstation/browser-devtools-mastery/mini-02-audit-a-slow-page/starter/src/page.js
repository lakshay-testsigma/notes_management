// The HTML of the product page.

export function renderHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Trail Backpack</title>
  <!-- TODO(1): Preload the hero: <link rel="preload" as="image" href="/hero.svg" fetchpriority="high"> -->
  <!-- TODO(2): This script blocks rendering. Make it non-blocking (defer). -->
  <script src="/analytics.js"></script>
  <script type="module" src="/app.js"></script>
  <style>
    body { font-family: sans-serif; max-width: 640px; margin: 2rem auto; }
    img { width: 100%; height: auto; }
  </style>
</head>
<body>
  <h1>Trail Backpack</h1>
  <!-- TODO(1): The hero is added late by the script below. Write the <img id="hero"
       src="/hero.svg" width="1200" height="600" alt="Trail Backpack" fetchpriority="high">
       directly in the HTML and delete the slot and the script. -->
  <div id="hero-slot"></div>
  <script>
    setTimeout(() => {
      document.querySelector("#hero-slot").innerHTML =
        '<img id="hero-late" src="/hero.svg" width="1200" height="600" alt="Trail Backpack">';
    }, 1500);
  </script>
  <button id="add">Add to cart</button>
  <p id="status"></p>
  <h2>Reviews</h2>
  <ul id="reviews"><li>Loading...</li></ul>
</body>
</html>`;
}
