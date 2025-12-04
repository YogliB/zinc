# DevFlow Dashboard

**Web-based visualization and monitoring interface for the DevFlow MCP server.**

---

## Overview

The DevFlow Dashboard is a SvelteKit-based web application that provides a visual interface for interacting with and monitoring the DevFlow MCP server. It runs automatically when the MCP server starts in production, serving as a real-time visualization layer for code analysis and context management.

## Architecture

### Static Build Strategy

The dashboard uses **`@sveltejs/adapter-static`** to build a purely static web application:

- **No SSR** - All rendering happens client-side
- **No API routes** - Backend logic is handled by MCP tools
- **SPA fallback** - All routes serve `index.html` for client-side routing
- **Static assets** - HTML, JavaScript, CSS, and images served from disk

This approach aligns with DevFlow's principle of preferring Bun native tools and keeps the dashboard lightweight and deployable anywhere.

### Production Integration

In production, the dashboard is served by an embedded Bun HTTP server inside the MCP server process:

```typescript
// Automatic startup when MCP server runs
Dashboard server started at http://localhost:3000
```

See [`packages/core/src/dashboard/server.ts`](../core/src/dashboard/server.ts) for the server implementation.

## Development

### Prerequisites

- Bun 1.3.2 or later
- Node.js 20+ (for Svelte tooling)

### Setup

```bash
# Install dependencies (from repo root)
bun install

# Start development server
bun run dev:dashboard
```

The dev server runs on `http://localhost:5173` by default (Vite).

### Available Scripts

```bash
# Development
bun run dev                  # Start Vite dev server
bun run preview             # Preview production build locally

# Building
bun run build               # Build for production (static files)
bun run check               # Run svelte-check for type errors

# Testing
bun run test                # Run all tests
bun run test:unit           # Run Vitest unit tests
bun run test:e2e            # Run Playwright E2E tests

# Linting & Formatting
bun run lint                # ESLint + Prettier check
bun run format              # Format code with Prettier

# Storybook
bun run storybook           # Start Storybook dev server
bun run build-storybook     # Build Storybook for deployment
```

## Building for Production

### Build Process

```bash
# From repo root
bun run build
```

This builds the dashboard **first**, then the MCP server. The build output is:

```
packages/dashboard/build/
├── index.html           # Entry point (SPA fallback)
├── _app/
│   ├── immutable/      # Hashed assets (JS, CSS)
│   └── version.json    # Build metadata
└── robots.txt
```

### Configuration

The build is configured in [`svelte.config.js`](./svelte.config.js):

```javascript
import adapter from '@sveltejs/adapter-static';

const config = {
  kit: {
    adapter: adapter({
      pages: 'build',           // Output directory
      assets: 'build',          // Assets directory
      fallback: 'index.html',   // SPA fallback for routing
      precompress: false,       // No gzip/brotli compression
      strict: true,             // Fail on missing pages
    }),
  },
};
```

### Why adapter-static?

- **Simplicity** - No Node.js server required
- **Performance** - Static files served directly by Bun
- **Flexibility** - Deploy to CDN, static hosting, or embedded server
- **Alignment** - Follows DevFlow's "Bun native tools" principle

## Production Deployment

### Embedded Server (Default)

The dashboard automatically starts with the MCP server:

```bash
# Start MCP server (dashboard starts automatically)
bun run dev:core

# Access dashboard
open http://localhost:3000
```

### Environment Variables

Configure the dashboard server via environment variables:

- **`DEVFLOW_DASHBOARD_ENABLED`** - Enable/disable dashboard (default: `true`)
- **`DEVFLOW_DASHBOARD_PORT`** - HTTP port (default: `3000`)

Example:

```bash
# Custom port
DEVFLOW_DASHBOARD_PORT=8080 bun run dev:core

# Disable dashboard
DEVFLOW_DASHBOARD_ENABLED=false bun run dev:core
```

### Standalone Deployment

You can also deploy the static build separately:

```bash
# Serve with any static file server
cd packages/dashboard/build
python3 -m http.server 3000

# Or use bun's built-in server
bun --bun serve build
```

## Technology Stack

- **Svelte 5** - UI framework with runes API
- **SvelteKit** - Application framework
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first styling
- **TypeScript** - Type safety
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **Storybook** - Component development

## Project Structure

```
packages/dashboard/
├── src/
│   ├── routes/              # SvelteKit routes (pages)
│   │   ├── +layout.svelte   # Root layout
│   │   └── +page.svelte     # Home page
│   ├── lib/                 # Reusable components, utilities
│   │   └── assets/          # Static assets (favicon, etc.)
│   ├── stories/             # Storybook component stories
│   └── app.html             # HTML template
├── static/                  # Public static files
├── build/                   # Production build output (gitignored)
├── e2e/                     # Playwright E2E tests
├── svelte.config.js         # SvelteKit configuration
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── playwright.config.ts     # Playwright configuration
```

## Contributing

See the main [CONTRIBUTING.md](../../docs/CONTRIBUTING.md) for general contribution guidelines.

### Dashboard-Specific Guidelines

1. **No Server-Side Logic** - Keep all backend operations in MCP tools
2. **Client-Side Only** - Dashboard is purely a visualization layer
3. **Svelte 5 Runes** - Use modern Svelte 5 syntax (`$state`, `$derived`, etc.)
4. **Accessibility** - Ensure components are keyboard and screen-reader accessible
5. **Testing** - Add unit tests for components and E2E tests for user flows

## License

MIT - See [LICENSE.md](../../LICENSE.md) for details.