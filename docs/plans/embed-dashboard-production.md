# Embed Dashboard in Production MCP Server

## Goal

Enable the dashboard web application to automatically start and be served when the MCP server runs in production, using static build + Bun's native HTTP server.

## Scope

- **In Scope:**
    - Switch dashboard to `@sveltejs/adapter-static`
    - Build dashboard to static files
    - Embed Bun HTTP server in MCP server.ts
    - Environment variable for dashboard port configuration
    - Update build pipeline to ensure dashboard builds before core
    - Add logging for dashboard server lifecycle
    - Update documentation for production deployment
- **Out of Scope:**
    - SSR/dynamic rendering (static only)
    - SvelteKit API routes (use MCP tools instead)
    - Dashboard authentication (separate concern)
    - Dashboard-to-MCP communication protocol (future work)
    - Development workflow changes (keep separate dev:core and dev:dashboard)

## Risks

- **Static routing complexity**: SvelteKit SPA fallback might need configuration
    - **Mitigation**: Use `fallback: 'index.html'` in adapter-static config, test all routes
- **Build order dependency**: Core build might run before dashboard build completes
    - **Mitigation**: Update root build script to sequential execution, add verification step
- **Port conflicts**: Dashboard port 3000 might be in use
    - **Mitigation**: Make port configurable via DEVFLOW_DASHBOARD_PORT, add error handling
- **File serving edge cases**: 404s, MIME types, asset paths
    - **Mitigation**: Use Bun.file() with proper path resolution, add content-type headers
- **Increased MCP server startup time**: HTTP server initialization adds overhead
    - **Mitigation**: Start dashboard server asynchronously, log startup time

## Dependencies

- `@sveltejs/adapter-static` (replace adapter-auto)
- Bun runtime (already in use)
- Dashboard build must complete before core build

## Priority

Medium

## Logging / Observability

- Dashboard server port and URL on startup
- Dashboard server startup time (ms)
- HTTP request errors (404s, failures)
- Dashboard build verification in CI
- Warning if DEVFLOW_DASHBOARD_PORT conflicts

## Implementation Plan (TODOs)

- [x] **Step 1: Configure Dashboard for Static Build**
    - [x] Add `@sveltejs/adapter-static` to dashboard dependencies
    - [x] Update `packages/dashboard/svelte.config.js` to use adapter-static
    - [x] Configure SPA fallback: `fallback: 'index.html'`
    - [x] Set build output directory: `pages: 'build'`
    - [x] Test local dashboard build: `bun run --filter dashboard build`
    - [x] Verify build output exists in `packages/dashboard/build/`

- [x] **Step 2: Create Dashboard Server Module**
    - [x] Create `packages/core/src/dashboard/server.ts`
    - [x] Implement `startDashboardServer(port: number)` function
    - [x] Use `Bun.serve()` with static file handler
    - [x] Add path normalization (remove trailing slashes, handle `/` -> `index.html`)
    - [x] Add MIME type detection using file extensions
    - [x] Add 404 fallback to index.html (SPA support)
    - [x] Return server instance for shutdown handling
    - [x] Add error handling for port conflicts

- [x] **Step 3: Integrate Dashboard Server into MCP Server**
    - [x] Import `startDashboardServer` in `packages/core/src/server.ts`
    - [x] Add environment variable parsing: `DEVFLOW_DASHBOARD_PORT` (default: 3000)
    - [x] Add `DEVFLOW_DASHBOARD_ENABLED` flag (default: true)
    - [x] Call `startDashboardServer()` in `main()` function after MCP initialization
    - [x] Start dashboard server asynchronously (non-blocking)
    - [x] Add dashboard startup time logging
    - [x] Add error logging if dashboard server fails to start
    - [x] Ensure MCP stdio remains unaffected by HTTP server

- [x] **Step 4: Update Build Pipeline**
    - [x] Modify root `package.json` build script to sequential: `bun run --filter dashboard build && bun run --filter devflow-mcp build`
    - [x] Add build verification step: check `packages/dashboard/build/index.html` exists
    - [x] Update `.github/workflows/ci.yml` to verify dashboard build output
    - [x] Ensure dashboard build output is included in distribution

- [x] **Step 5: Add Configuration and Environment Variables**
    - [x] Document `DEVFLOW_DASHBOARD_PORT` in `docs/SETUP.md`
    - [x] Document `DEVFLOW_DASHBOARD_ENABLED` in `docs/SETUP.md`
    - [x] Add default values to server initialization
    - [x] Add validation for port number (1-65535)
    - [x] Add logging for configured vs actual port

- [ ] **Step 6: Handle Edge Cases**
    - [ ] Add graceful shutdown for dashboard server
    - [ ] Handle missing dashboard build directory (log warning, continue MCP startup)
    - [ ] Add Content-Type headers for common file types (html, js, css, svg, png)
    - [ ] Test SPA routing (e.g., `/some/route` should serve index.html)
    - [ ] Add CORS headers if needed for local development

## Docs

- [x] **docs/SETUP.md**: Add "Dashboard Server" section
    - [x] Document DEVFLOW_DASHBOARD_PORT environment variable
    - [x] Document DEVFLOW_DASHBOARD_ENABLED flag
    - [x] Document default port (3000)
    - [x] Add example: accessing dashboard at http://localhost:3000
- [x] **docs/ARCHITECTURE.md**: Update "Packages" section
    - [x] Document dashboard server module location
    - [x] Explain static build integration
    - [x] Document production deployment pattern
- [x] **packages/dashboard/README.md**: Update build instructions
    - [x] Document adapter-static usage
    - [x] Explain SPA fallback configuration
    - [x] Add production build command
- [x] **Root README.md**: Add dashboard access info in Quick Start

## Testing

- [ ] **Unit tests**
    - [ ] Test dashboard server file path resolution
    - [ ] Test MIME type detection
    - [ ] Test port parsing and validation
    - [ ] Test error handling for missing build directory
- [ ] **Integration tests**
    - [ ] Test MCP server starts with dashboard enabled
    - [ ] Test MCP server starts with dashboard disabled
    - [ ] Test dashboard serves index.html at root
    - [ ] Test dashboard serves static assets (js, css)
    - [ ] Test SPA fallback for client-side routes
    - [ ] Test 404 handling
    - [ ] Test port conflict handling
- [ ] **Manual testing**
    - [ ] Build dashboard and verify static output
    - [ ] Start MCP server and access dashboard
    - [ ] Test all dashboard routes work
    - [ ] Test with custom DEVFLOW_DASHBOARD_PORT
    - [ ] Test with DEVFLOW_DASHBOARD_ENABLED=false

## Acceptance

- [x] Dashboard builds to static files successfully
- [x] MCP server automatically starts dashboard HTTP server on port 3000 (or configured port)
- [x] Dashboard is accessible at http://localhost:3000 when MCP server runs
- [x] MCP stdio communication remains unaffected
- [x] All dashboard routes work (SPA fallback functional)
- [x] Static assets (JS, CSS, images) serve correctly with proper MIME types
- [x] Dashboard server startup logs include port and URL
- [x] Port conflicts are handled gracefully with error message
- [x] CI pipeline verifies dashboard build exists
- [x] Documentation updated with dashboard access instructions
- [ ] Tests pass for dashboard server functionality

## Fallback Plan

If static build approach causes issues:
1. Revert to separate deployment model (document how to run dashboard separately)
2. Provide Docker Compose example with both services
3. Document reverse proxy setup (nginx) for production

If Bun.serve() has limitations:
1. Fall back to Node.js http.createServer() with static file serving
2. Consider using lightweight library like `sirv` for static serving

## References

- SvelteKit adapter-static docs: https://svelte.dev/docs/kit/adapter-static
- Bun.serve() API: https://bun.sh/docs/api/http
- Project AGENTS.md: Prefer Bun native tools principle
- Current MCP server: `packages/core/src/server.ts`
- Dashboard config: `packages/dashboard/svelte.config.js`

## Complexity Check

- TODO Count: 37
- Depth: 2 (max nesting level)
- Cross-deps: 3 (dashboard build → core server → docs)
- High Risk Items: 2 (build order, file serving edge cases)
- **Decision:** Proceed (within single PR scope, well-defined atomic tasks)