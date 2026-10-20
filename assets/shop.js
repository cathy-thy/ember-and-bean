// Catalog, cart and shared layout. Each page sets <body data-base="./"> or "../".
var BASE = document.body ? document.body.dataset.base : './';

var PRODUCTS = [
  { id: 'house-blend', name: 'House Blend', origin: 'Colombia · Brazil', roast: 'Medium', notes: 'Milk chocolate, toasted almond, caramel', price: 16.00, colors: ['#c9773b', '#6b3a1e'] },
  { id: 'ethiopia-guji', name: 'Ethiopia Guji', origin: 'Guji, Ethiopia', roast: 'Light', notes: 'Blueberry, jasmine, lemon zest', price: 21.00, colors: ['#e3a857', '#8c4b2b'] },
  { id: 'night-owl', name: 'Night Owl Espresso', origin: 'Sumatra · Guatemala', roast: 'Dark', notes: 'Dark cocoa, molasses, cedar', price: 18.00, colors: ['#5c3a2e', '#1f1410'] },
  { id: 'decaf-kenya', name: 'Swiss Water Decaf', origin: 'Nyeri, Kenya', roast: 'Medium', notes: 'Blackcurrant, brown sugar, plum', price: 19.00, colors: ['#9b6a4f', '#3d2a22'] }
];

function findProduct(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }
function money(n) { return '$' + n.toFixed(2); }

function bagArt(p) {
  var g = 'g-' + p.id;
  return '<svg viewBox="0 0 200 240" role="img" aria-label="' + p.name + ' bag">' +
    '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="' + p.colors[0] + '"/><stop offset="1" stop-color="' + p.colors[1] + '"/></linearGradient></defs>' +
    '<path d="M48 40 L152 40 L166 220 Q100 232 34 220 Z" fill="url(#' + g + ')"/>' +
    '<path d="M48 40 L152 40 L150 62 L50 62 Z" fill="rgba(0,0,0,.18)"/>' +
    '<rect x="62" y="96" width="76" height="86" rx="6" fill="#f6efe6"/>' +
    '<text x="100" y="124" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="13" fill="#3b2418">EMBER</text>' +
    '<text x="100" y="140" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="10" fill="#3b2418">&amp; BEAN</text>' +
    '<line x1="74" y1="150" x2="126" y2="150" stroke="#3b2418" stroke-width="1"/>' +
    '<text x="100" y="167" text-anchor="middle" font-family="Inter, sans-serif" font-size="8" fill="#6b4a3a">' + p.roast.toUpperCase() + ' ROAST</text>' +
    '</svg>';
}

// ---- cart (localStorage) ----
function getCart() {
  try { return JSON.parse(localStorage.getItem('eb_cart') || '[]'); } catch (e) { return []; }
}
function saveCart(cart) {
  try { localStorage.setItem('eb_cart', JSON.stringify(cart)); } catch (e) {}
  updateCartCount();
}
function addToCart(id, qty) {
  var cart = getCart();
  var line = cart.filter(function (l) { return l.id === id; })[0];
  if (line) line.qty += qty; else cart.push({ id: id, qty: qty });
  saveCart(cart);
}
function cartLines() {
  return getCart().map(function (l) { return { product: findProduct(l.id), qty: l.qty }; })
    .filter(function (l) { return l.product; });
}
function cartTotal() {
  return cartLines().reduce(function (s, l) { return s + l.product.price * l.qty; }, 0);
}
function updateCartCount() {
  var n = getCart().reduce(function (s, l) { return s + l.qty; }, 0);
  var el = document.getElementById('cart-count');
  if (el) { el.textContent = n; el.hidden = n === 0; }
}

// Pixel "contents" payload for a list of {product, qty}.
function pixelContents(lines) {
  return {
    contents: lines.map(function (l) {
      return { content_id: l.product.id, content_type: 'product', content_name: l.product.name, quantity: l.qty, price: l.product.price };
    }),
    content_type: 'product',
    value: Math.round(lines.reduce(function (s, l) { return s + l.product.price * l.qty; }, 0) * 100) / 100,
    currency: 'USD'
  };
}

// ---- layout ----
function renderLayout() {
  var header = document.getElementById('site-header');
  if (header) {
    header.innerHTML =
      '<div class="announce">Free shipping on orders over $40 · Roasted every Tuesday</div>' +
      '<div class="nav container">' +
      '  <a class="logo" href="' + BASE + '">Ember <span>&amp;</span> Bean</a>' +
      '  <nav class="links">' +
      '    <a href="' + BASE + '#shop">Shop</a>' +
      '    <a href="' + BASE + '#story">Our story</a>' +
      '    <a href="' + BASE + '#subscribe">Subscribe</a>' +
      '  </nav>' +
      '  <form class="search" id="search-form" action="' + BASE + '" method="get" role="search">' +
      '    <input name="q" id="search-input" type="search" placeholder="Search coffee" aria-label="Search coffee">' +
      '  </form>' +
      '  <a class="cart-link" id="cart-link" href="' + BASE + 'cart/">Bag <span id="cart-count" class="badge" hidden>0</span></a>' +
      '</div>';
  }
  var footer = document.getElementById('site-footer');
  if (footer) {
    footer.innerHTML =
      '<div class="container footer-grid">' +
      '  <div><div class="logo">Ember <span>&amp;</span> Bean</div><p>Small-batch coffee, roasted to order.</p></div>' +
      '  <div><h4>Shop</h4><a href="' + BASE + '#shop">All coffee</a><a href="' + BASE + 'product/?id=night-owl">Espresso</a><a href="' + BASE + 'product/?id=decaf-kenya">Decaf</a></div>' +
      '  <div><h4>Help</h4><a href="' + BASE + '#story">About us</a><a href="mailto:hello@example.com" id="contact-link">Contact</a></div>' +
      '</div>' +
      '<div class="container fine">© ' + new Date().getFullYear() + ' Ember &amp; Bean Coffee Roasters</div>';
  }
  updateCartCount();
  var contact = document.getElementById('contact-link');
  if (contact) contact.addEventListener('click', function () { track('Contact'); });
}

function toast(html) {
  var t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = html;
  document.body.appendChild(t);
  setTimeout(function () { t.classList.add('show'); }, 10);
  setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 300); }, 3200);
}

renderLayout();
