# Outway Web (Next.js 14)

**Project.** Public client site — "Outway, nature routes across Uzbekistan." SSR catalog for tours and destinations, optional user auth for liking, reviewing, and joining tours. One of 5 sibling repos (backend, admin, **web**, bot, mobile); the primary focus per `~/.claude` memory.

## Commands

Package manager: **pnpm**.

```bash
pnpm install
pnpm dev      # next dev -p 3003
pnpm build    # next build
pnpm start    # next start -p 3003
pnpm lint     # next lint
pnpm format   # prettier on app/, components/, lib/
```

Backend must be reachable at the URL in `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:3000/v1`).

## Architecture

- **Next.js 14 App Router** (no `pages/`). Server Components by default; `'use client'` only for interactive bits.
- **Tailwind v3** + custom tokens (Airbnb-flavored, `#ff385c` accent).
- **shadcn/ui** (Radix wrappers in `components/ui/`).
- **TanStack Query v5** for client-side data (auth-gated mutations); SSR pages use direct `fetch` with `next: { revalidate: 30 }`.
- **Zustand** for client preferences (likes, prefs hydrated in `app/providers.tsx` via `PreferencesHydrator`).
- **Leaflet** + `react-leaflet` for maps (with a `leaflet-fix.ts` shim to avoid SSR hydration issues).
- **No `react-hook-form` / no Zod.** Forms use plain `useState` — validation is implicit and server-side.
- **i18n is hand-rolled.** No `next-intl`. Cookie `booktrip.lang` (`uz` default, `en`, `ru`), read on the server in `app/layout.tsx`; static JSON dictionaries in `messages/{uz,en,ru}/{common,tours,destinations}.json`; client helper `t(dict, namespace, 'key.path')`.

Folder layout:

```
app/
  layout.tsx                # reads lang cookie, mounts Providers
  providers.tsx             # QueryClient + AuthProvider + PreferencesHydrator
  page.tsx                  # home (hero, categories, featured, for-you)
  tours/page.tsx            # search/filter/map dual view
  tours/[slug]/page.tsx     # tour detail (gallery, info, itinerary, reviews, booking bar)
  destinations/page.tsx
  destinations/[slug]/page.tsx
  organizations/[id]/page.tsx
  settings/page.tsx         # auth-gated profile
components/
  layout/  auth/  home/  tours/  destinations/  ui/
lib/
  api.ts                    # server-side fetcher (GET, revalidate:30)
  api-client.ts             # client-side fetcher (auth header, cache:'no-store')
  auth.tsx                  # AuthProvider, useAuth, localStorage tokens
  i18n.ts / i18n-server.ts  # cookie-based language resolution
  preferences.ts            # Zustand store
  types.ts                  # Tour, Place, Organization, Review
  gpx.ts  utils.ts
messages/                   # uz/, en/, ru/
```

## Conventions

- Server components fetch via `lib/api.ts` (`revalidate: 30`); client components hit `lib/api-client.ts` (`cache: 'no-store'`).
- `'use client'` only at the leaves that need it (modals, forms, map, like button).
- File names **kebab-case** (`site-header.tsx`, `tour-card.tsx`); components named-exported.
- `AuthModalHost` is a singleton portal registered once on `AuthProvider` via refs — don't drive it from React state.
- Translation lookup: `t(dict, 'tours', 'filters.priceMax')` — keys are dotted paths, not flat strings.
- Header nav (`components/layout/site-header.tsx`): `/`, `/tours`, `/destinations`, with `usePathname().startsWith(...)` for active state. Tagline is "Nature routes" (see line 32).
- **Feature doc is mandatory upkeep.** `docs/web-features.md` is the living feature catalogue. Any time you add, change, or remove a page/route, nav or footer item, or a cross-cutting system, update that doc in the same change — a web change isn't done until the doc reflects it.

## External Contracts (consumed)

Base URL: `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:3000/v1`). See `backend/CLAUDE.md` for the source of truth.

**Server-side (`lib/api.ts`, SSR):**
- `GET /tours` (q, dateFrom/To, priceMin/Max, categories[], difficulty, durationMin/Max, sort, page, limit, orgId, destination)
- `GET /tours/featured`, `GET /tours/for-you`, `GET /tours/this-weekend`
- `GET /tours/by-slug/:slug`, `GET /tours/:id`, `GET /tours/:id/reviews`
- `GET /places`, `GET /places/by-slug/:slug`, `GET /places/:id/upcoming-tours`
- `GET /organizations/:id`

**Client-side (`lib/api-client.ts`, mostly auth-gated):**
- `POST /auth/quick-register` (no auth) → `{ accessToken, user }`
- `GET /auth/me`
- `POST /tours/:id/interest` `{ selectedDepartureDate? }`, `DELETE /tours/:id/interest`
- `POST /tours/:id/like`, `DELETE /tours/:id/like`
- `GET /users/me/liked-ids`
- `GET /tours/:id/review/eligibility`, `GET /tours/:id/review`, `POST /tours/:id/review` `{ rating, body, photoUrls? }`, `DELETE /tours/:id/review`
- `POST /tours/:id/view` (no auth, fire-and-forget)
- `PATCH /users/me` (fullName, phone, email, preferredDestinations, preferredPriceMax)

## Gotchas

- **No form library.** When adding forms, decide deliberately whether to introduce `react-hook-form`/Zod or keep the manual pattern. Current code trims strings and trusts the server.
- **Leaflet + SSR.** Always import map components through the existing dynamic-import path / `leaflet-fix.ts`. A direct top-level import will break the build.
- **Two cache strategies on purpose.** Don't switch SSR calls to `cache: 'no-store'` or client calls to `next: { revalidate }` — they'd silently change behavior.
- **AuthModalHost singleton.** Only one host is registered (via `auth._register()`); don't re-mount it inside a page.
- **Tokens in localStorage** (`booktrip.user.token`, `booktrip.user.profile`). Distinct from admin's `booktrip.admin.*` keys.
- **CORS.** Web runs on `:3003` and is whitelisted by backend's `CORS_ORIGINS`. Changing the dev port requires a backend env update.

## Env Vars (`.env.example`)

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/v1
NEXT_PUBLIC_DEFAULT_LANG=uz
```

## Unsure / Verify Manually

- Whether per-route `generateMetadata` exists for `/tours/[slug]` and `/destinations/[slug]` (root metadata is hardcoded; dynamic metadata not confirmed).
- Whether a `sitemap.ts` / `robots.ts` is present.
- Image optimization config — `next.config` not deeply inspected; remotePatterns for backend `/uploads/*` should be verified.
- Whether the org profile page (`/organizations/[id]`) is fully implemented or scaffold-only.
