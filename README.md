# Ember & Bean

A small static coffee shop used to test a TikTok Pixel on GitHub Pages. Nothing is actually sold.

## Deploy

1. Push this folder's contents to the root of a GitHub repo (include `.nojekyll`).
2. Repo → Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
3. Live at `https://<user>.github.io/<repo>/` after a minute or two.

## Where events fire

| Page | Trigger | Pixel event (API `event_type`) |
|---|---|---|
| every page | load | `ttq.page()` (PAGE_VIEW) |
| `/?q=...` (header search) | search submitted | `Search` (ON_WEB_SEARCH) |
| `/` newsletter | sign-up | `identify` (hashed email) + `Subscribe` |
| `/product/?id=...` | load | `ViewContent` (ON_WEB_DETAIL) |
| `/product/` | "Add to bag" | `AddToCart` (ON_WEB_CART) |
| `/product/` | "Save for later" | `AddToWishlist` |
| `/checkout/` | load | `InitiateCheckout` (INITIATE_ORDER) |
| `/checkout/` | choose a payment option | `AddPaymentInfo` (ADD_BILLING) |
| `/checkout/` | "Place order" | `identify` (hashed email/phone) + `PlaceAnOrder` |
| `/thank-you/` | load (once per order) | `CompletePayment` (SHOPPING) |
| footer "Contact" | click | `Contact` |

All events carry `contents` / `value` / `currency` where relevant and a unique `event_id`.

## URL switches

Each is remembered in localStorage, so you only set it once per browser.

- `?pixel=CODE` — use another pixel (default `DB89AARC77U5NP324L00`)
- `?debug=1` — show a floating event log (`?debug=0` hides it)
- `?track=off` — stop all code-fired events, leaving only `ttq.page()`. Use this when testing Events Manager → Event Builder rules so code and rules don't double-count. `?track=on` restores.

## Event Builder targets

Stable ids for click rules: `#add-to-bag`, `#add-to-wishlist`, `#checkout-button`, `#place-order`, `#subscribe-button`, `#hero-shop`, `#cart-link`.
URL rules: `/product/`, `/cart/`, `/checkout/`, `/thank-you/`.

## Verifying

Use the TikTok Pixel Helper Chrome extension, or Events Manager → pixel → Test Events. Ad blockers block `analytics.tiktok.com`.
