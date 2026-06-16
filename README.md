# book-trip-web

Public Next.js 14 (App Router) catalog for BookTrip. SSR for SEO. Airbnb-flavored
design system tokens lifted from [`docs/DESIGN.md`](../docs/DESIGN.md).

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev          # http://localhost:3003
```

Backend (`../backend`) must be running on :3000 for the catalog to load.

## Routes

| Path | Purpose |
|------|---------|
| `/` | Home — hero, category strip, featured tour grids |
| `/tours` | Search + filter + map/list dual view |
| `/tours/[slug]` | Single long-page detail (gallery → key info → itinerary → reviews → booking) |
| `/organizations/[id]` | Public org profile (planned) |

## Design

- **Rausch** (`#ff385c`) is the single primary voltage — used scarcely.
- White canvas, ink (`#222`) text, hairline borders, single shadow tier.
- Cards: `rounded-md` (14px). Buttons: `rounded-sm` (8px). Search: `rounded-full`.
- Type: Inter as a Cereal VF substitute.

## i18n

Locale via cookie `booktrip.lang` (`uz` default, `en`, `ru`). Server reads the
cookie in `app/layout.tsx`; client components consume via the same dictionary.
