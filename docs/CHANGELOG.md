# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- **Performance Improvements**
    - Lazy loading for TypeScript file parsing (65-270x faster initialization)
    - Server initialization: ~13.5s → ~50-200ms
    - Background file preloading support (optional)
    - Environment variables for performance tuning:
        - `DEVFLOW_PRELOAD_FILES` - Enable background file preloading
        - `DEVFLOW_PRELOAD_PATTERNS` - Custom glob patterns for preloading
    - Detailed initialization timing logs for all phases
    - Memory-efficient file loading (only loads files on-demand)

### Changed

- **TypeScript Plugin**
    - Files now loaded on-demand instead of eagerly at startup
    - Added `getOrLoadSourceFile()` method with built-in caching
    - Added `preloadFiles()` method for optional background loading
    - Tracks loaded files in memory-efficient Set structure

- **Server Initialization**
    - Added timing logs for each initialization phase
    - Non-blocking background preload (when enabled)
    - Helper functions for environment variable parsing

### Performance

- **Benchmarks** (typical development project):
    - 100 files: ~50-100ms initialization, ~200ms first analysis
    - 500 files: ~150-200ms initialization, ~250ms first analysis
    - 1000 files: ~180-250ms initialization, ~300ms first analysis
    - Cache performance: First call ~200-500ms, subsequent <1ms
    - Memory usage: <50MB overhead for 200+ files (without preload)

### Documentation

- Added lazy loading architecture section to ARCHITECTURE.md
- Added environment variables documentation to SETUP.md
- Added performance notes to USAGE.md
- Enhanced performance tuning guidelines in ARCHITECTURE.md

### Testing

- Added comprehensive unit tests for lazy loading (20 tests)
- Added integration tests for analysis engine (14 tests)
- Added performance benchmarks (10 tests)
- All 160 tests passing across 22 test files

### Planned

- Additional language plugin support (Python, Go, Rust)
- Enhanced AST analysis with specialized parsers
- Improved pattern detection
- Incremental analysis improvements

---

## [0.0.1] - 2024-12-28

### Added

- **Project Analysis Tools**
    - `getProjectOnboarding` - Extract project metadata from package.json, README, and tsconfig.json

- **Architecture Tools**
    - `getArchitecture` - Get architectural overview with symbols, patterns, and relationships

- **Symbol Tools**
    - `findSymbol` - Search for symbols by name and type
    - `findReferences` - Find all references to a symbol

- **Pattern Tools**
    - `detectPatterns` - Detect design patterns in code
    - `detectAntiPatterns` - Identify code smells and anti-patterns

- **Graph Tools**
    - `getDependencyGraph` - Build dependency graph between files and modules

- **Git Tools**
    - `getRecentDecisions` - Extract architectural decisions from git commit messages
    - `analyzeChangeVelocity` - Analyze file change frequency and stability

- **Context Tools**
    - `getContextForFile` - Get comprehensive context for a file
    - `summarizeFile` - Generate high-level file summary

- **Core Infrastructure**
    - Analysis engine with plugin architecture
    - TypeScript plugin for code analysis
    - Storage engine with path validation
    - Git analyzer for repository insights
    - File watcher with cache invalidation
    - Git-aware caching system

- **MCP Integration**
    - FastMCP server implementation
    - Tool registration system
    - Cross-platform support (Cursor, Claude Desktop, Zed)

- **Documentation**
    - Setup guide
    - Architecture documentation
    - Testing guide
    - Security policy
    - Usage guide

### Technical Details

- Built with Bun runtime
- TypeScript with strict type checking
- Zod schema validation
- ts-morph for AST manipulation
- simple-git for git operations

---

## Types of Changes

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security vulnerability fixes

---

**Note:** This changelog tracks changes from version 0.0.1 onwards. For earlier versions, see git history.
