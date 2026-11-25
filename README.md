# The Guesthouse by Balinsasayaw

Official website for **The Guesthouse by Balinsasayaw**, a guesthouse on PEO Road, Bancao-Bancao, Puerto Princesa City, Palawan.

Live preview: https://rhythmic-gold-leopard-75.hostingersite.com/

## Overview

A fast, mobile-first, single-page website built with plain HTML, CSS and vanilla JavaScript. It has no build step, no database and no backend, so it runs on any static or shared host (deployed on Hostinger).

## Features

- **Hero quick-booking bar**: check-in, check-out and guests, with a live count of rooms free tonight.
- **Room availability**: per-room status for the selected dates, a 7–10 day mini calendar, the next free date for booked rooms, and booked rooms disabled in the room picker.
- **Booking request form**: validation (Philippine mobile numbers, date rules), night count, and a review modal that opens a prefilled email or SMS to the guesthouse, plus copy-to-clipboard. No payment is taken; requests are confirmed manually.
- **Rooms**: Twin, Double, Queen and Single rooms with photo overlays, status badges and a lightbox gallery.
- **Scroll-driven gallery**: pinned horizontal strip on desktop, swipe carousel on phones.
- **Clean URLs**: `/rooms`, `/book`, `/gallery`, `/location`, `/contact` (served by `.htaccess`), with smooth in-page navigation and working back/forward.
- **Location and contact**: embedded map, directions link, tap-to-call, SMS and email.
- **Accessibility**: semantic landmarks, labelled fields with inline errors, keyboard support, visible focus, `prefers-reduced-motion` support.

## Project structure

```
.
├── index.html          # Single-page site
├── .htaccess           # HTTPS, clean URLs, compression and caching (Apache/LiteSpeed)
├── css/
│   └── style.css       # Design tokens, layout, components, responsive rules
├── js/
│   └── main.js         # Navigation, availability, booking flow, gallery, lightbox
├── assets/
│   ├── favicon.svg
│   └── img/            # Room and restaurant photography (full and -sm variants)
└── PRODUCT.md          # Product notes: audience, facts, constraints
```

## Local preview

Open `index.html` directly in a browser, or serve the folder:

```bash
npx serve .
# or
python -m http.server 8080
```

Clean URLs such as `/rooms` require the `.htaccess` rules, so they work on the live server only. Locally, navigation scrolls in place.

## Deployment (Hostinger)

1. Open **hPanel → Websites → File Manager** for the site.
2. Upload the contents of this repository into `public_html/`:
   `index.html`, `.htaccess`, `css/`, `js/`, `assets/`.
3. Do not upload `README.md`, `PRODUCT.md` or `.gitignore`.

The site must sit at the domain root for the clean URLs to resolve.

**Cache busting:** Hostinger's CDN caches CSS and JS for 7 days. After changing `css/style.css` or `js/main.js`, bump the `?v=` value on their `<link>` and `<script>` tags in `index.html` and upload `index.html` too. HTML is not cached, so visitors get the new files immediately.

## Room availability data

Availability currently uses **sample data** for demonstration. It is defined in `js/main.js` (`ROOMS` and `BOOKED`):

```js
// Offsets in days from today: check-in day included, check-out day free
{ room: "Twin Room", from: 2, to: 5 }

// Or fixed dates
{ room: "Twin Room", from: "2026-12-20", to: "2026-12-27" }
```

Replace the sample entries with real bookings before relying on the status shown to guests.

## Contact

- Phone / SMS: 0999 884 6076
- Email: theguesthouse.balinsasayaw2026@gmail.com
- Address: PEO Road, Bancao-Bancao, Puerto Princesa City, Palawan 5300
