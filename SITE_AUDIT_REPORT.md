# Site Audit Report

Date: 2026-04-14

## Scope

This review covers product purpose, sector fit, current design direction, frontend and backend code quality, UX, security, performance, and maintainability for the `Photographymarketplacewebsite` repository.

## Product Understanding

### Purpose

The repository is primarily a digital photography asset marketplace: customers browse, buy, and download photos, bundles, posters, typography, and banners. That positioning is stated clearly in [README.md](README.md) and supported by the product, cart, order, download-access, and admin flows.

Evidence:

- `README.md:1-3`
- `src/app/routes.tsx`
- `backend/prisma/schema.prisma`

### Sector

This sits in the creative commerce / digital asset marketplace space, with a secondary photography-services lead generation angle.

### Core User Journeys Present In Code

1. Browse and filter products
2. View product details by resolution
3. Add to wishlist/cart
4. Pay via Razorpay
5. Receive time-limited download access
6. Admin manages products, categories, blogs, services, ads, inquiries, and settings

## Current Design And UX Snapshot

### What The Site Currently Feels Like

The application has two different identities:

- The marketplace identity: digital asset browsing, instant downloads, licensing, cart, checkout, orders.
- The studio identity: wedding shoots, portraits, commercial bookings, quote inquiries, studio testimonials.

This split is visible in the content:

- Marketplace framing in `README.md:1-3`, `src/app/pages/about-page.tsx:7-14`, checkout, cart, product, and orders flows.
- Studio/service framing in `src/app/pages/home-page.tsx:28-158` and `src/app/pages/services-page.tsx:157-196`.

### Visual Design Pattern

- Home page: cinematic, premium, full-screen hero, heavy gradients, custom CSS, animated background.
- Inner pages: mostly standard white cards, gray borders, blue accent buttons, basic Tailwind layouts.
- Admin: clean but generic dashboard shell.

This creates a noticeable visual disconnect between the landing experience and the rest of the product.

Evidence:

- `src/styles/landing.css:7-220`
- `src/app/pages/home-page.tsx:28-158`
- `src/app/components/header.tsx:29-175`
- `src/app/pages/about-page.tsx:1-18`

## What Is Working Well

- The stack is sensible for this product: React + Vite frontend, Express + Prisma backend, object storage abstraction, Razorpay integration.
- The schema models real marketplace concerns well, including download access windows and payment event tracking.
- The admin surface is broad enough to operate the catalog and supporting content.
- Frontend production build succeeds.

Verification:

- `npm run build` completed successfully.
- Current frontend build output includes a large main JS bundle: `dist/assets/index-DPG4DxkS.js` at about `1,118.38 kB` before gzip.

## Prioritized Findings

### Critical

| Area | Finding | Why It Matters | Evidence | Recommendation |
| --- | --- | --- | --- | --- |
| Security | Default admin credentials are publicly documented, displayed in the login UI, and printed by the seed script. | This creates an immediate account takeover risk if the seeded account exists in any shared or non-local environment. | `README.md:92-95`, `src/app/pages/login-page.tsx:86-90`, `backend/prisma/seed.js:6-8`, `backend/prisma/seed.js:37-38` | Remove all public credential exposure, force env-only admin bootstrap, rotate existing seeded credentials, and require first-login password reset. |
| Security | OTP fallback prints live verification/reset OTP codes to logs when SMTP is not configured. | Any operator, log collector, or compromised log sink can read OTPs and bypass account verification or password reset. | `backend/src/services/emailService.js:55-58` | Fail closed in non-dev environments. In development, log a redacted/local-only debug message instead of the real OTP. |

### High

| Area | Finding | Why It Matters | Evidence | Recommendation |
| --- | --- | --- | --- | --- |
| Security | Access and refresh tokens are stored in `localStorage` and manually attached to requests. | Any XSS issue would immediately expose session tokens; refresh tokens are especially sensitive. | `src/app/services/api.ts:51-60`, `src/app/services/api.ts:75-83`, `src/app/services/api.ts:178-199`, `src/app/contexts/auth-context.tsx:53-59`, `src/app/contexts/auth-context.tsx:77-78`, `src/app/contexts/auth-context.tsx:128-129` | Move auth to `HttpOnly`, `Secure`, `SameSite` cookies, add CSRF protection where needed, and remove refresh-token handling from browser JS. |
| Security | The API lacks baseline hardening such as `helmet`, rate limiting, and abuse protection for auth/contact/OTP endpoints. | Login, OTP resend, password reset, and inquiry endpoints are brute-force and spam targets. | `backend/src/server.js:12-31`, `backend/src/controllers/authController.js:20-53`, `backend/src/controllers/authController.js:168-205`, `backend/src/controllers/contactController.js:13-66`, `backend/package.json:22-37` | Add `helmet`, IP and user-based rate limiting, request-size and abuse controls, OTP attempt caps, and CAPTCHA or equivalent for public forms. |
| Security | Password validation is too weak and inconsistent. Registration, reset, and change-password flows do not enforce minimum strength. | Weak passwords increase account compromise risk, especially when login throttling is absent. | `backend/src/controllers/authController.js:104-124`, `backend/src/controllers/authController.js:369-401`, `backend/src/controllers/authController.js:515+`, `backend/package.json:30` | Add centralized validation using `express-validator` or schema validation, with minimum length, banned-password checks, and consistent rules across register/reset/change flows. |
| Security / Stability | File uploads use in-memory buffering and trust extension + MIME type checks only. | This increases memory pressure and does not reliably prove file authenticity. | `backend/src/storage/uploadMiddleware.js:4-37` | Stream large uploads, validate file signatures/magic bytes, tighten limits per route, and separate image uploads from ZIP/PDF flows. |
| Product Strategy | The product positioning is split between “digital asset marketplace” and “photography studio services”. | Users do not get a clear primary action, which weakens conversion and brand trust. | `README.md:1-3`, `src/app/pages/home-page.tsx:28-158`, `src/app/pages/services-page.tsx:157-196`, `src/app/pages/about-page.tsx:7-14` | Decide the primary business model. If marketplace-first, move services to a secondary funnel. If services-first, the catalog should become supporting proof rather than the core nav structure. |

### Medium

| Area | Finding | Why It Matters | Evidence | Recommendation |
| --- | --- | --- | --- | --- |
| UX / Navigation | Mobile navigation is incomplete. Main nav links are hidden on smaller breakpoints, but there is no hamburger menu or mobile drawer. | Mobile users lose direct access to Explore, Services, and Blog from the header. | `src/app/components/header.tsx:57-71`, `src/app/components/header.tsx:160-173` | Add a proper mobile navigation drawer with core destinations, auth actions, and category shortcuts. |
| UX / Filtering | Explore page UI suggests multi-select filters, but only the first selected category/type/orientation is sent to the backend. Price filtering also happens client-side after pagination. | Users see filter controls that do not behave as expected, and product counts can be misleading. | `src/app/pages/explore-page.tsx:65-79`, `src/app/pages/explore-page.tsx:110-115`, `src/app/pages/explore-page.tsx:146-151`, `src/app/pages/explore-page.tsx:257-258` | Align UI and backend capability: either support real multi-select filtering server-side or switch the UI to single-select. Move price filtering server-side. |
| Frontend Architecture | Several pages bypass the shared API service and directly build URLs from `import.meta.env.VITE_API_URL` without fallback handling. | This duplicates request logic and can break when `VITE_API_URL` is absent even though the shared API layer already has a default. | `src/app/pages/services-page.tsx:72-87`, `src/app/pages/services-page.tsx:113-121`, `src/app/pages/admin/site-config.tsx:40-68` | Route all network requests through the shared API service and use one base URL source. |
| Backend Maintainability | Multiple controllers instantiate their own `PrismaClient` instead of reusing the shared database client. | This increases connection-management risk and creates inconsistent backend patterns. | `backend/src/controllers/contactController.js:6-8`, `backend/src/controllers/siteConfigController.js:6-8`, `backend/src/controllers/serviceController.js:8`, `backend/src/config/database.js` | Use one shared Prisma instance everywhere. |
| Trust / Conversion | Ads are wired into the root layout and ad settings are fetched globally. This is risky on trust-sensitive flows such as login, cart, checkout, and order history. | Ads can hurt trust and distract during conversion. They also add extra network/script cost. | `src/app/layouts/root-layout.tsx:17-26`, `src/app/components/google-ads.tsx:21-31`, `src/app/components/google-ads.tsx:155-171` | Exclude transactional/account pages from ads by default and lazy-load ad code only where monetization is intentional. |
| Credibility | Footer social links are placeholders. | Dead links weaken credibility and create low-quality polish issues. | `src/app/components/footer.tsx:20-32` | Replace with real links or remove the icons entirely until real profiles exist. |
| Content Depth | The About page is too thin for a commercial marketplace. | It does not build enough trust around licensing, curation standards, creators, refund policy, or business legitimacy. | `src/app/pages/about-page.tsx:1-18` | Expand About into a real trust page with mission, licensing, quality standards, delivery model, founder/team proof, and support policy. |
| UX / Flow | Product “Buy Now” uses a hard redirect via `window.location.href`. | This breaks SPA navigation consistency and makes state handling harder. | `src/app/pages/product-detail-page.tsx:131-136` | Use router navigation consistently. |

### Low

| Area | Finding | Why It Matters | Evidence | Recommendation |
| --- | --- | --- | --- | --- |
| Performance | The frontend bundle is large for a commerce site. | Slower first load hurts discovery and conversion, especially on mobile networks. | `npm run build` output, `package.json:15-70` | Code-split route-level pages, lazy-load admin, audit heavy dependencies, and remove unused packages. |
| Dependency Hygiene | The frontend dependency list is broad, while some libraries appear unused or only lightly used. | Extra dependencies increase bundle size, maintenance surface, and supply-chain risk. | `package.json:15-70`, code search showed very limited use of some packages | Remove unused packages, especially parallel UI systems and drag/drop/chart libs if they are not actively needed. |
| Type Safety | There is broad use of `any` in frontend API consumers and admin pages. | This weakens refactoring safety and makes regressions easier to miss. | `src/app/pages/explore-page.tsx:23-24`, `src/app/pages/login-page.tsx:21`, `src/app/contexts/auth-context.tsx:34`, `src/app/services/api.ts` | Introduce typed API response models and replace `any` incrementally in high-traffic flows first. |

## Design And Alignment Improvements

### Recommended Direction

If the intended business is a marketplace, the site should be re-centered around:

- Discover
- License
- Download
- Reuse

That means the home page should lead with:

1. Asset categories and collections
2. Licensing clarity
3. Quality/resolution trust
4. Fast purchase/download flow
5. Social proof from buyers and brands, not only service clients

### Current Design Problems

- The home page hero and testimonial language are service-booking heavy.
- Inner pages feel significantly more generic than the home page.
- Blue/purple gradients and studio language do not consistently match the marketplace value proposition.
- The animated/premium visual layer is not translated into the browse, product, checkout, and account flows.

### Design Improvements

1. Pick one primary visual story.
2. Standardize a design system for spacing, card styles, section rhythm, and page headers.
3. Carry the premium visual language into Explore, Product, Cart, Checkout, and Orders.
4. Improve typography hierarchy and reduce generic white-card repetition.
5. Add marketplace-specific trust modules: licensing, file quality, download policy, refund/access rules, and creator/customer proof.

## UX Improvements

### High-Impact UX Fixes

1. Add mobile navigation and a clearer header IA.
2. Make filtering truthful and server-driven.
3. Improve checkout with license summary, access duration summary, and post-purchase expectations.
4. Add empty states and recovery states with stronger next actions.
5. Remove trust-breaking distractions from checkout/account flows.

### Additional Feature Opportunities

1. Collections, curated themes, and seasonal campaigns
2. Resolution comparison and license comparison before purchase
3. Download library with expiry countdown and reissue workflow
4. Creator stories or featured photographer spotlights
5. Better search relevance with tags, color, orientation, and use-case filters
6. Commercial licensing FAQ and usage examples

## Engineering And Code Quality Improvements

### Standards

1. Centralize validation on the backend instead of mixing ad hoc checks.
2. Replace repeated direct `fetch` usage with typed service modules.
3. Create shared frontend types for API responses instead of relying on `any`.
4. Consolidate data-fetching and error handling patterns.
5. Reuse the shared Prisma client everywhere.

### Maintainability

1. Separate marketing-site concerns from app-shell concerns.
2. Lazy-load large route groups, especially admin pages and optional integrations.
3. Add linting and tests for critical commerce flows.
4. Add a real environment/config validation layer at backend startup.

## Security Improvements

### Immediate

1. Remove seeded admin credentials from UI/docs/logs.
2. Stop logging OTPs.
3. Add rate limiting to auth, OTP, contact, and payment-related endpoints.
4. Introduce consistent request validation.

### Next

1. Move session handling to secure cookies.
2. Add `helmet` and a tighter CSP.
3. Harden uploads with file-signature validation and safer storage flow.
4. Add audit logging for admin actions and auth anomalies.
5. Review authorization boundaries across admin/media/service/site-config routes.

## Performance And Optimization

### Observations

- Frontend build passes, but the main JS bundle is too large for a storefront.
- Ad loading, animated background, and globally mounted extras add ongoing cost.
- The current dependency surface is broader than the visible product surface.

### Recommendations

1. Split public storefront, admin, and optional integrations into separate lazy chunks.
2. Load Razorpay only at checkout, which is already partially done.
3. Load Google Ads only on explicitly monetized pages.
4. Audit package usage and remove dead dependencies.
5. Optimize images and ensure all public imagery uses modern formats and correct sizing.

## Overall Assessment

This is a promising full-stack foundation with real marketplace capabilities already present. The main gaps are not basic functionality; they are clarity, trust, and hardening.

The most important conclusion is this:

- The codebase is closer to a working digital marketplace than a studio brochure.
- The current marketing/design layer often presents it as a photography services brand instead.

If you fix the security basics, simplify the product story, and align the design with the actual commerce flow, the site will feel much more credible and conversion-ready.
