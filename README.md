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
