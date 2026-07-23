# Developer Portfolio

Production architecture for a database-backed developer portfolio built with React, Express, MongoDB, and a performance-focused motion system.

## Architecture Decisions

- **Frontend:** React 19 + Vite, React Router, TailwindCSS, Framer Motion, GSAP, Lenis, Zustand, React Hook Form, TanStack Query, Axios, React Icons, Lottie, and Swiper.
- **Backend:** Node.js + Express, Mongoose, Nodemailer, and CORS.
- **Data:** MongoDB is the source of truth for portfolio content, projects, experience, testimonials, and contact submissions.
- **Deployment:** Vercel serves the `client`; Render, Railway, or a VPS serves the `server`; MongoDB Local is used during development and MongoDB Atlas is the production-compatible upgrade path.
- **Rendering:** The first release uses a fast client-rendered shell with deterministic metadata, semantic HTML, and cacheable API data. If organic search becomes a primary acquisition channel, the component boundaries are ready to migrate to an SSR framework without changing domain modules or API contracts.
- **Boundary:** `client` never talks to MongoDB. All persistence and email operations stay behind the Express API.

## Folder Structure

```text
Portfolio/
	client/
		public/
			fonts/
			icons/
			images/
			manifest.webmanifest
		src/
			app/
				App.jsx
				router.jsx
				providers.jsx
				queryClient.js
			assets/
			components/
				ui/                  # Buttons, links, dialogs, loaders, focus states
				layout/              # Header, footer, page container, navigation
				motion/              # Shared reveal, route, and reduced-motion helpers
			features/
				home/                # Hero, selected work, skills, CTA
				projects/            # Filters, project grid, project detail
				experience/          # Timeline and career entries
				contact/             # Form, validation, mutation, feedback states
			hooks/
			lib/
				api.js               # Axios instance and response normalization
				seo.js
				analytics.js
				motion.js
			pages/
				HomePage.jsx
				ProjectsPage.jsx
				ProjectDetailPage.jsx
				NotFoundPage.jsx
			stores/
				uiStore.js           # Theme, menu, reduced visual preferences
			styles/
				tokens.css
				globals.css
			main.jsx
		eslint.config.js
		index.html
		package.json
		vite.config.js
	server/
		config/
			env.js
			database.js
			mail.js
		controllers/
			portfolioController.js
			projectController.js
			contactController.js
		middlewares/
			errorHandler.js
			notFound.js
			rateLimit.js
			validate.js
			securityHeaders.js
		models/
			Profile.js
			Project.js
			Experience.js
			Testimonial.js
			ContactMessage.js
		routes/
			portfolioRoutes.js
			projectRoutes.js
			contactRoutes.js
			healthRoutes.js
		utils/
			asyncHandler.js
			apiError.js
			slug.js
			sanitize.js
		validators/
			contactValidator.js
		server.js
		.env.example
	README.md
```

Feature modules own their UI, query hooks, schemas, and view-specific behavior. Shared components contain only stable primitives; page components compose features instead of becoming a second design system.

## API Structure

Base URL: `/api/v1`. JSON responses use one predictable envelope:

```json
{ "success": true, "data": {}, "meta": {} }
```

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/health` | Liveness and database status |
| `GET` | `/api/v1/portfolio` | Profile, skills, experience, featured projects, and social links |
| `GET` | `/api/v1/projects` | Paginated project list with `tag`, `featured`, and `search` filters |
| `GET` | `/api/v1/projects/:slug` | Public project detail |
| `POST` | `/api/v1/contact` | Validate, rate-limit, persist, and email a contact message |

Public endpoints are read-only except for contact submission. Controllers stay thin: validate input, call a model/service operation, and return the envelope. Errors flow through one error middleware with stable error codes. No admin API is exposed in the first release; content can be seeded or managed directly in MongoDB until authentication and role-based access are required.

## Database Design

All collections use timestamps, schema validation, and indexes only for real access patterns.

### `profiles`

One document for the public identity and site-wide content: `name`, `title`, `bio`, `location`, `avatar`, `resumeUrl`, `socialLinks`, `availability`, `seo`, and `theme`. Add a unique `key: "primary"` to avoid accidental duplicate profiles.

### `projects`

`title`, unique `slug`, `summary`, `description`, `role`, `year`, `featured`, `status`, `coverImage`, `gallery`, `technologies`, `liveUrl`, `repoUrl`, `metrics`, and `seo`. Index `{ featured: -1, year: -1 }`, `{ technologies: 1 }`, and `{ slug: 1 }` unique.

### `experiences`

`company`, `role`, `location`, `startDate`, nullable `endDate`, `summary`, `achievements`, `technologies`, and `order`. Index `{ order: 1 }`.

### `testimonials`

`author`, `role`, `company`, `quote`, `avatar`, `featured`, and `order`. Index `{ featured: -1, order: 1 }`.

### `contactMessages`

`name`, `email`, `subject`, `message`, `status`, `ipHash`, `userAgent`, `createdAt`, and `processedAt`. Never store raw secrets. Index `{ status: 1, createdAt: -1 }` and add a TTL policy only if product policy permits deleting old messages.

## Performance

- Keep the initial route small: load only the home shell and defer project detail, Swiper, Lottie, and non-critical animation code.
- Cache GET responses with TanStack Query (`staleTime` for portfolio content, explicit invalidation after content changes).
- Enable gzip/Brotli at the deployment edge, long-lived immutable caching for hashed assets, and short cache headers for API responses.
- Use stable list keys, avoid unnecessary global state, and measure Core Web Vitals in production.
- Virtualization is unnecessary for the expected project count; introduce it only when real data volume justifies it.
- Server: use connection pooling, graceful shutdown, request size limits, structured logs, health checks, and one shared Mongoose connection.

## Scalability

The client is split by route and feature, while the server is split by resource and middleware. This supports adding an authenticated content admin later without coupling it to the public UI. Use environment-based configuration, migrations/seed scripts, API versioning, and a service layer once domain operations exceed simple CRUD. For production, move image delivery to an image CDN/object store and MongoDB from local to Atlas; the document contracts remain unchanged.

## SEO

- Every route gets a unique title, description, canonical URL, Open Graph image, and Twitter card metadata.
- Use semantic `header`, `nav`, `main`, `section`, `article`, and `footer` elements with one meaningful `h1` per page.
- Generate `sitemap.xml`, `robots.txt`, and JSON-LD for `Person`, `WebSite`, and `CreativeWork` project pages.
- Slug-based project URLs are stable and shareable; missing records return a real 404 state.
- Add a static content fallback for core identity and contact links so the page remains meaningful during an API outage.

## Image Optimization

Store source images outside the JS bundle where possible. Serve AVIF/WebP with responsive `srcSet` sizes, explicit `width`/`height` or `aspect-ratio`, descriptive alt text, and lazy loading below the fold. The hero image is the only eager image and must be compressed before commit. Decorative images use empty alt text; project images describe the work rather than repeating the title. Use a CDN transformation layer in production.

## Animation Strategy

- **Lenis:** one root smooth-scroll instance, enabled only for pointer-capable environments and disabled for reduced-motion users.
- **Framer Motion:** route transitions, section reveals, shared layout transitions, and component-level state changes.
- **GSAP:** timeline-based hero choreography and scroll-linked sequences that need precise sequencing; scope and kill every context on unmount.
- **Lottie:** small, meaningful empty/success states only; lazy-load the player and avoid animation for essential information.
- **Swiper:** project media galleries only, with keyboard controls and a no-JavaScript readable fallback.

Animation must not delay content, change layout unexpectedly, or be the only way to understand state. Respect `prefers-reduced-motion` with a shared hook and CSS media query. Avoid running multiple scroll engines on the same page.

## Theme Strategy

Use semantic CSS variables rather than hard-coded component colors: `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-accent`, `--color-border`, and focus tokens. Define a deliberately art-directed light theme and a considered dark theme, with `system`, `light`, and `dark` modes persisted in Zustand. Tailwind consumes the same tokens so utility classes and CSS modules do not drift. Contrast must meet WCAG AA; color is never the sole state signal.

## Premium UI System

The visual language is a precision studio for shipped software: editorial typography, dense but breathable layouts, quiet surfaces, and controlled bursts of color. It borrows the clarity of Linear, the material restraint of Apple, the technical confidence of Vercel, the polish of Stripe, and the motion vocabulary of Framer without reproducing any of their layouts or branding.

### Design Principles

- **Signal over decoration:** hierarchy comes from type, spacing, contrast, and one intentional accent rather than excessive cards or gradients.
- **Material depth:** surfaces are layered with translucency, blur, fine borders, and shadows. Glass is reserved for navigation, floating controls, dialogs, and elevated feature moments.
- **Motion with purpose:** movement explains continuity, focus, hierarchy, or feedback. Ambient motion is slow and never competes with content.
- **Editorial rhythm:** use asymmetric compositions, deliberate negative space, and oversized but controlled display type to avoid a generic dashboard grid.
- **One focal moment:** each viewport has one dominant action or visual anchor. Secondary content stays quieter.

### Color Palette

The tokens below are the source of truth. Components consume semantic tokens, never raw hex values. The default accent is `lime`; the other accents are selectable and persisted per user.

| Token | Dark | Light | Purpose |
| --- | --- | --- | --- |
| `--color-bg` | `#08090B` | `#F6F7F2` | Page canvas |
| `--color-bg-raised` | `#101216` | `#FFFFFF` | Raised canvas regions |
| `--color-surface` | `rgb(22 25 31 / 0.72)` | `rgb(255 255 255 / 0.72)` | Glass and cards |
| `--color-surface-solid` | `#171A20` | `#FFFFFF` | Opaque surfaces |
| `--color-text` | `#F2F4EF` | `#111412` | Primary copy |
| `--color-text-muted` | `#9CA39D` | `#667069` | Secondary copy |
| `--color-text-subtle` | `#68716A` | `#8A938D` | Tertiary copy |
| `--color-border` | `rgb(255 255 255 / 0.11)` | `rgb(17 20 18 / 0.12)` | Default boundary |
| `--color-border-strong` | `rgb(255 255 255 / 0.20)` | `rgb(17 20 18 / 0.20)` | Hover and focus boundary |
| `--color-accent` | `#C7F36B` | `#5C8F18` | Primary interactive signal |
| `--color-accent-soft` | `rgb(199 243 107 / 0.14)` | `rgb(92 143 24 / 0.12)` | Accent wash |
| `--color-success` | `#74D69B` | `#18794E` | Positive status |
| `--color-warning` | `#F4C96B` | `#9A6500` | Caution status |
| `--color-danger` | `#F58C86` | `#B42318` | Error status |

Accent presets:

| Name | Dark value | Light value | Character |
| --- | --- | --- | --- |
| `lime` | `#C7F36B` | `#5C8F18` | Default, energetic, technical |
| `cyan` | `#6DE4F5` | `#087F94` | Precise, digital, cool |
| `coral` | `#FF967D` | `#C74D32` | Warm, human, expressive |
| `amber` | `#F5C76B` | `#9A6500` | Focused, editorial, confident |

Light mode uses the same semantic contrast hierarchy rather than simply inverting dark mode. Dark mode is the expressive default; light mode is porcelain and ink with softened borders. Accent colors must pass contrast requirements in text/button contexts, with the raw vivid value used only for decoration or large surfaces when necessary.

### Design Tokens

```css
:root {
	--font-display: "Satoshi", "Inter", sans-serif;
	--font-body: "Inter", sans-serif;
	--tracking-display: -0.035em;
	--tracking-body: 0;
	--radius-sm: 8px;
	--radius-md: 14px;
	--radius-lg: 22px;
	--radius-pill: 999px;
	--shadow-card: 0 18px 60px rgb(0 0 0 / 0.16);
	--shadow-float: 0 22px 80px rgb(0 0 0 / 0.24);
	--shadow-glow: 0 0 48px var(--color-accent-soft);
	--blur-glass: 18px;
	--ease-standard: cubic-bezier(0.22, 1, 0.36, 1);
	--ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
}
```

All tokens have CSS-variable equivalents under `client/src/styles/tokens.css`. Tailwind aliases semantic names such as `bg-canvas`, `bg-surface`, `text-primary`, `text-muted`, `border-default`, and `accent` so utility usage remains theme-aware.

### Spacing Scale

Use a 4px base with an editorial section rhythm. Component internals use the compact scale; page sections use the larger scale.

| Token | Value | Typical use |
| --- | --- | --- |
| `space-1` | `4px` | Icon/text gap, hairline offset |
| `space-2` | `8px` | Tight control padding |
| `space-3` | `12px` | Tag and input internals |
| `space-4` | `16px` | Standard component gap |
| `space-5` | `20px` | Card padding on mobile |
| `space-6` | `24px` | Card padding on desktop |
| `space-8` | `32px` | Cluster and toolbar gap |
| `space-10` | `40px` | Local section spacing |
| `space-12` | `48px` | Small section separation |
| `space-16` | `64px` | Standard section separation |
| `space-24` | `96px` | Hero and major section separation |
| `space-32` | `128px` | Large desktop composition spacing |

Use `clamp()` between scale steps for page-level spacing, for example `padding-block: clamp(64px, 10vw, 128px)`. Do not use arbitrary one-off spacing values unless a composition genuinely requires it.

### Typography Scale

Load self-hosted Inter and Satoshi in WOFF2 format with `font-display: swap`. Satoshi is reserved for display headings and prominent numeric or label moments; Inter handles reading, UI, forms, and metadata.

| Style | Font | Size | Line height | Weight |
| --- | --- | --- | --- | --- |
| Display | Satoshi | `clamp(3.25rem, 8vw, 7.5rem)` | `0.92` | 600 |
| H1 | Satoshi | `clamp(2.75rem, 6vw, 5.5rem)` | `0.96` | 600 |
| H2 | Satoshi | `clamp(2rem, 4vw, 3.5rem)` | `1.02` | 600 |
| H3 | Satoshi | `clamp(1.35rem, 2vw, 2rem)` | `1.1` | 600 |
| Body large | Inter | `1.125rem` | `1.6` | 400 |
| Body | Inter | `1rem` | `1.55` | 400 |
| UI | Inter | `0.875rem` | `1.35` | 500 |
| Eyebrow | Inter | `0.6875rem` | `1.2` | 600 |

Display type may use the defined display tracking token, but body and UI typography use zero letter spacing. Use sentence case for navigation and actions; use uppercase only for short eyebrows and metadata labels.

### Component Styling Rules

- **Page shell:** full-width atmospheric canvas with a centered `max-width: 1280px` content rail and responsive horizontal padding. Sections are unframed bands, not cards stacked inside cards.
- **Sticky navbar:** translucent glass bar, 1px semantic border, backdrop blur, compact desktop links, and a mobile menu that preserves focus. It becomes slightly more opaque after scroll.
- **Floating dock:** a compact pill reserved for secondary navigation or theme/accent controls. It is fixed only when it does not cover content, uses safe-area insets, and collapses to an icon control on narrow screens.
- **Glass cards:** `background: var(--color-surface)`, `backdrop-filter: blur(var(--blur-glass))`, subtle border, `--shadow-card`, and a 14-22px radius. Use for repeated project items and focused tools, never as the page's default section wrapper.
- **Buttons:** primary buttons use a solid accent surface with dark ink, secondary buttons use a glass surface, and tertiary actions are text/icon links. Minimum target size is 44px. Include icons only when they clarify the action.
- **Magnetic buttons:** desktop pointer interaction translates the button by at most 6px toward the pointer and eases back on leave. Disable for touch, coarse pointers, and reduced motion. The hit area and layout box never move.
- **Animated cards:** use a restrained border-light sweep, 2-4px lift, and accent glow on hover. Do not scale cards enough to affect neighboring layout or cause accidental hover chaining.
- **Inputs:** quiet opaque/glass surfaces, visible labels, accent focus ring, inline validation, and a clear submitted/loading state. Never communicate validity with color alone.
- **Glow effects:** use radial gradients and box shadows behind focal elements only. Keep blur layers clipped and low opacity so text remains crisp.
- **Noise texture:** apply a tiny monochrome noise asset or CSS mask to the page atmosphere at `0.025-0.045` opacity. It is decorative, excluded from hit testing, and disabled when it causes measurable paint cost.
- **Rounded layout:** use 8px for controls, 14px for cards, 22px for feature surfaces, and pills only for tags, compact controls, and the floating dock. Avoid excessive pill-shaped containers.

### Atmospheric Background

The background is a layered system: base canvas, two or three low-opacity aurora fields, a slowly animated gradient mesh, and the noise layer. Aurora positions differ between themes and accent presets. The mesh animates on a long 18-30 second loop using transform/opacity rather than layout properties; it is `aria-hidden`, pointer-events disabled, and removed under reduced motion or low-power preferences. Content always sits on a readable surface or clear contrast zone, never directly over a busy hotspot.

### Animation Timing

| Token | Duration | Use |
| --- | --- | --- |
| `instant` | `80ms` | Press and focus feedback |
| `fast` | `160ms` | Icon, color, and border transitions |
| `base` | `240ms` | Buttons, cards, menus |
| `slow` | `480ms` | Panels, section state changes |
| `reveal` | `700ms` | Scroll reveals and route entrances |
| `ambient` | `18-30s` | Aurora and mesh loops |

Framer Motion owns component state and route transitions. GSAP owns the hero timeline and any deliberately sequenced parallax. Lenis owns smooth scrolling. Scroll reveal uses one shared observer or motion primitive, with stagger capped at 80ms and reveal distance capped at 32px. Section transitions should crossfade or translate existing content; avoid forced full-screen loaders.

### Interaction and Motion System

- **Animated cursor:** a small accent dot plus a soft trailing ring appears only for fine pointers and disappears on touch. It follows with interpolation, changes label/state for links and draggable media, and never replaces the native cursor for essential affordance.
- **Parallax layers:** hero media, atmospheric fields, and decorative geometry move at different low-amplitude rates. All layers remain clipped, do not affect document flow, and switch to static positions on reduced motion or mobile when battery/performance is constrained.
- **Scroll reveal:** headings, copy, and cards reveal in reading order with opacity and a short vertical offset. Keep content visible if JavaScript or motion is unavailable.
- **Micro interactions:** button press compression, input focus glow, copied-link confirmation, filter transitions, and image crossfades should complete quickly and preserve the user's spatial context.
- **Hover behavior:** hover is enhancement only. Every interaction has a keyboard and touch equivalent, with `:focus-visible` matching the visual quality of hover.
- **Reduced motion:** a single preference from `prefers-reduced-motion` and Zustand disables cursor trails, magnetic translation, mesh animation, smooth scrolling, parallax, and large transforms while retaining instant state feedback.

### Responsive Composition

Start at 320px with one column, 20px page gutters, a compact navbar, and no floating dock obstruction. At 768px, introduce two-column project and experience compositions where content supports it. At 1024px, enable asymmetric hero layouts, parallax, and the full dock. At 1280px and above, cap the content rail and increase negative space rather than endlessly widening text.

Use CSS grid for composition, `minmax(0, 1fr)` for content tracks, and `clamp()` for type and section spacing. Preserve stable aspect ratios for project media and reserve space before images load. Test 320px, 375px, 768px, 1024px, 1440px, keyboard navigation, 200% zoom, light/dark themes, each accent, touch input, and reduced motion.

### Theme Persistence and Runtime Contract

Zustand persists `themeMode` (`system | light | dark`) and `accentName` (`lime | cyan | coral | amber`) in a versioned local-storage key. On boot, resolve `system` through `matchMedia`, apply the `data-theme` and `data-accent` attributes before the first paint when possible, and keep the preference controls keyboard accessible. If storage is unavailable, fall back to system theme and lime accent without blocking render.

## Responsive Strategy

Design from a single-column mobile baseline, then introduce layout changes at content-driven breakpoints. Use a constrained reading width, fluid spacing tokens, CSS grid for project layouts, and `clamp()` for display type without viewport-dependent letter-spacing. Keep touch targets at least 44px, avoid horizontal overflow, support landscape phones, and test at 320px, 768px, 1024px, and wide desktop widths.

## Accessibility

Keyboard navigation is a release requirement: visible focus, logical tab order, skip link, semantic landmarks, labeled form controls, accessible dialogs, and keyboard-operable galleries. Use `aria-live` for async form feedback, associate validation messages with fields, preserve focus after route/dialog changes, and never use motion or hover as the only interaction. Test with axe, keyboard-only navigation, reduced motion, high zoom, and screen-reader landmarks.

## Code Splitting and Lazy Loading

Use `React.lazy` for `ProjectsPage`, `ProjectDetailPage`, and any heavy visual module. Load Swiper, GSAP, Lottie, and Lenis only from the features that need them. Keep the home hero's critical copy and navigation in the first bundle. Use route-level error boundaries and skeletons so a failed secondary chunk does not blank the entire site.

## Component Reusability

Reusable primitives should have explicit contracts and no portfolio-specific data fetching: `Button`, `TextLink`, `SectionHeading`, `ResponsiveImage`, `ProjectCard`, `Tag`, `Modal`, `Field`, `StatusMessage`, and `PageContainer`. Feature hooks such as `usePortfolioQuery`, `useProjectsQuery`, and `useContactMutation` own server state. Zustand owns only client UI preferences; TanStack Query owns remote data. This prevents duplicated loading logic and keeps future pages composable.

## Delivery Sequence

1. Replace the Vite starter with tokens, layout primitives, router, API client, and static fallback content.
2. Add MongoDB connection, schemas, seed data, health route, and public portfolio/project routes.
3. Build the home and project experiences, then add contact validation, persistence, rate limiting, and Nodemailer.
4. Add responsive/accessibility coverage, SEO assets, performance measurement, and production environment configuration.
5. Verify `npm run lint`, `npm run build`, API smoke tests, Lighthouse, keyboard navigation, reduced motion, and mobile/desktop visual regression before deployment.
