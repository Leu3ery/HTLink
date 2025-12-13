# HTLink Frontend Guide

This document explains how the Angular frontend is organized, how styling works, and how to extend it with new features. It is intended for engineers who have never seen the codebase before.

## Stack & Tooling

- **Framework**: Angular 21 with standalone components (no NgModules).【F:client/package.json†L4-L36】
- **Language/TS config**: Strict TypeScript with bundler resolution and path aliases for `@app`, `@core`, `@shared`, and `@svg`.【F:client/tsconfig.json†L4-L34】
- **Key libraries**: HTTP client  interceptors, Angular Service Worker, ngx-markdown, ng-icons (Hero icons), RxJS.【F:client/app/app.config.ts†L1-L38】
- **Scripts**: `npm start` for local dev, `npm run build` for production bundles, `npm test` for Karma/Jasmine, `npm run svg` to generate icon components from `src/assets/svg`.【F:client/package.json†L5-L27】

## Project Layout

```
client/
  src/
    app/
      app.config.ts      // Global providers & infrastructure
      app.routes.ts      // Route map
      app.ts, app.html   // Root component shell
      core/              // Reusable services, guards, types, env constants
      pages/             // Feature pages (feed, projects, marketplace, etc.)
      shared/            // Shared UI components & utilities
    styles.css           // Global styles and design tokens
```

### Routing

- Root layout wraps all child pages and handles navigation chrome.【F:client/src/app/app.routes.ts†L18-L79】
- Feature segments:
  - `feed`, `marketplace`, `news`, `users` (news/users guarded by auth).【F:client/src/app/app.routes.ts†L21-L47】
  - `projects` with `search` and `my` (auth-guarded) plus dynamic `projects/:project_id` subtree (`project.routes`).【F:client/src/app/app.routes.ts†L23-L39】【F:client/src/app/app.routes.ts†L81-L84】
  - `more` container with authenticated dashboard and public `more/login` for guests (reverse guard).【F:client/src/app/app.routes.ts†L49-L65】
  - Profile shortcuts: `profile/:id` and `/profile/me/edit` (guarded).【F:client/src/app/app.routes.ts†L67-L75】
     - Fallback redirects unknown paths to `/feed`.【F:client/src/app/app.routes.ts†L85-L88】

### Core Layer

- **Guards**: `AuthGuard` enforces authenticated access; `NotAuthGuard` keeps logged-in users out of guest pages (redirects accordingly).【F:client/src/app/core/gruards/auth.guard.ts†L1-L31】【F:client/src/app/core/gruards/notauth.guard.ts†L1-L31】
- **Interceptors**: `loggingInterceptor` prefixes relative API calls with `API_URL` and injects bearer tokens; `errorCatcher` handles 401/403/500 responses and surfaces notifications/logouts. Both are registered globally in `app.config.ts`.【F:client/src/app/shared/utils/interceptors.ts†L1-L43】【F:client/src/app/shared/utils/interceptors.ts†L45-L64】【F:client/src/app/app.config.ts†L15-L38】
- **Environment constants**: `API_URL`, `DEFAULT_AVATAR_URL`, and `isDevMode` flags live in `core/eviroments/config.constants.ts`; dev mode forces relative HTTP requests to point at `API_URL`.【F:client/src/app/core/eviroments/config.constants.ts†L1-L3】【F:client/src/app/shared/utils/interceptors.ts†L13-L21】
- **Services**: Auth, notification, navigation, profile, projects, app update, and markdown/readme utilities reside in `core/services/` and are consumed by pages/components via DI.

### Shared Layer

- **UI primitives**: Located in `shared/ui/` (e.g., `block`, `select`, `modal`, `tag`, `project-preview`, `search-bar`, `image-gallery`, `notifications`). These are standalone components meant for composition across pages; `Block` is the common card container used in layouts.【F:client/src/app/shared/ui/block/block.ts†L1-L11】【F:client/src/app/shared/ui/block/block.css†L1-L16】
- **Utilities**: Pipes (`fileToDataUrl`, `img`), helper functions (`visibleOnce`, `cleanObject`, `utils.ts`), SVG component generator output (`shared/utils/svg.component.ts`), and HTTP interceptors (above).【F:client/src/app/shared/utils/interceptors.ts†L1-L64】

### Pages Layer

- Feature folders under `pages/` group page components by domain: `feed`, `projects` (subfolders for search, my, create, and dynamic project routes), `marketplace`, `news`, `users`, `profile` (with `children/edit`), and `main` (layout  more-pages component).【F:client/src/app/app.routes.ts†L21-L65】【F:client/src/app/pages/feed/feed.ts†L1-L9】【F:client/src/app/pages/main/layout/layout.ts†L1-L26】
- Each page is a standalone component with its own template and stylesheet; content is intentionally minimal in scaffolding (e.g., `feed` placeholder) to encourage feature-specific markup.【F:client/src/app/pages/feed/feed.html†L1-L2】
- `Layout` defines the persistent navigation bar/header and exposes the page list used for side/bottom navigation; active state is derived from the current URL.【F:client/src/app/pages/main/layout/layout.ts†L10-L26】【F:client/src/app/pages/main/layout/layout.css†L1-L64】

## Styling System

- Global design tokens (colors, typography, base resets) live in `src/styles.css`. Key variables include `--bg-color`, `--main-color`, grayscale palette, and shared UI primitives such as `.btn`, `.input-holder`, `.tag`, `.avatar`, etc.【F:client/src/styles.css†L1-L112】【F:client/src/styles.css†L114-L167】
- Components opt into these tokens via standard CSS; standalone component styles (e.g., `layout.css`, `block.css`) layer on top of the global variables for spacing, layout, and responsive tweaks.【F:client/src/app/pages/main/layout/layout.css†L1-L64】【F:client/src/app/shared/ui/block/block.css†L1-L16】
- Use `ng-icon` with the configured icon packs; default icon size/stroke is set globally via `provideNgIconsConfig` in `app.config.ts`.【F:client/src/app/app.config.ts†L29-L38】

## Application Shell

- Global providers are registered in `app.config.ts`: router, HTTP client with interceptors, service worker (enabled outside dev), Markdown renderer, icon packs, error listeners, and zone change detection tweaks. This file is the entry point for any cross-cutting concerns or library registration.【F:client/src/app/app.config.ts†L1-L38】
- The root template `app.html` hosts only a `RouterOutlet`, deferring layout to routed components (not shown here but follows Angular standalone conventions).

## Working with Routes & Guards

1. Add a new standalone component under `pages/<feature>/<name>/` with its HTML/CSS.
2. Register the route in `app.routes.ts` (or nested route file) and attach guards:
   - Use `AuthGuard` for authenticated-only pages.
   - Use `NotAuthGuard` for guest-only flows (e.g., login/registration).【F:client/src/app/core/gruards/auth.guard.ts†L1-L31】【F:client/src/app/core/gruards/notauth.guard.ts†L1-L31】
      3. If the feature requires API calls, inject `HttpClient`; relative URLs will be prefixed with `API_URL` automatically in dev mode. Add any new base URLs or flags to `core/eviroments/config.constants.ts`.【F:client/src/app/shared/utils/interceptors.ts†L13-L21】【F:client/src/app/core/eviroments/config.constants.ts†L1-L3】
      4. Surface errors or session expirations through `NotificationService` to keep UX consistent; the `errorCatcher` interceptor already triggers common cases.

## Styling Conventions for New Features

- Prefer wrapping content in `app-block` to inherit consistent padding, radius, and shadow. Use global classes (`.btn`, `.btn.main`, `.input-holder`, `.tag`, `.avatar`) for common controls before inventing new ones.【F:client/src/app/shared/ui/block/block.css†L1-L16】【F:client/src/styles.css†L48-L167】
- Keep components responsive with flex layouts; follow the mobile breakpoint example in `layout.css` (switches nav to bottom bar under 800px).【F:client/src/app/pages/main/layout/layout.css†L32-L64】
- Import Google Font `JetBrains Mono` is globally set; avoid overriding font family unless necessary.【F:client/src/styles.css†L1-L35】

## Adding Shared UI or Utilities

- Place reusable visual elements under `shared/ui/<component>/` as standalone components (HTML  CSS  TS). Export them via their component class and import directly where needed (no module aggregation required).【F:client/src/app/shared/ui/block/block.ts†L1-L11】
- Utility functions/pipes belong in `shared/utils/`; keep them framework-agnostic where possible. Register additional interceptors in `app.config.ts` alongside existing ones.【F:client/src/app/shared/utils/interceptors.ts†L1-L64】【F:client/src/app/app.config.ts†L15-L38】

## Development Workflow

1. **Install**: `npm install` inside `client/`.
2. **Run dev server**: `npm start` (serves on `0.0.0.0`, hot reload).【F:client/package.json†L5-L19】
3. **Code**: Build standalone components/pages, wire routes, and rely on services/guards/utilities above.
4. **Test**: `npm test` for unit tests; add specs per component/service when extending functionality.【F:client/package.json†L15-L24】
5. **Build**: `npm run build` for production bundles; service worker registration auto-enables outside dev mode.【F:client/package.json†L11-L13】【F:client/src/app/app.config.ts†L15-L28】

Following this guide should give new contributors enough context to add pages, reuse styling, and extend infrastructure without diving through the entire codebase first.
