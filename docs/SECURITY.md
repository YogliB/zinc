# Security Policy

## Overview

DevFlow MCP is an early-stage MCP (Model Context Protocol) server designed to manage project context across AI agents. Security is a critical priority, especially as the project evolves from Phase 1 Foundation toward production use.

## Supported Versions

DevFlow MCP follows semantic versioning (MAJOR.MINOR.PATCH). Security updates are provided for:

| Version | Status     | Security Support      |
| ------- | ---------- | --------------------- |
| 0.1.x   | Current    | ✅ Active development |
| < 0.1   | Deprecated | ❌ No support         |

**Note:** Version 0.x is pre-release. Breaking changes may occur without notice. Lock your dependencies with exact versions (see `package.json` for our approach).

## Security Considerations

### Design Principles

- **No hardcoded secrets** - All sensitive data must be externalized
- **File-based storage** - Primary storage in human-readable Markdown/JSON (review before committing)
- **Type safety** - Strict TypeScript catches errors at compile time
- **Least privilege** - File permissions respected; no privilege escalation
- **Transparency** - All operations logged and auditable

### Current Limitations (Pre-Release)

This project is in active development (Phase 1). Before production use, ensure:

- ✅ Run with appropriate file system permissions
- ✅ Store project directories in secure locations
- ✅ Don't commit sensitive data to `.devflow/memory/` or `.devflow/rules/`
- ✅ Use `.gitignore` to exclude sensitive decision logs or contexts
- ✅ Review all generated files before committing to git
- ⚠️ SQLite indexing (Phase 2) will need security review before enabling

### Known Constraints

- **No encryption at rest** - Files stored as plaintext Markdown/JSON
- **No authentication** - MCP server runs locally; assumes trusted environment
- **No access control** - File system permissions determine access
- **Memory persistence** - Decisions and context stored indefinitely (configure `.gitignore` as needed)

## Reporting Security Vulnerabilities

We take security seriously. Please report vulnerabilities responsibly.

### Do Not

- ❌ Open public GitHub issues for security vulnerabilities
- ❌ Publish exploit details publicly
- ❌ Test on production systems without permission

### Do

✅ Email security concerns to: **[Report via GitHub Security Advisory](https://github.com/yogevbd/dev-toolkit-mcp/security/advisories)**

**Expected Response Time:**

- Critical (CVSS 9-10): Within 24 hours
- High (CVSS 7-8): Within 48 hours
- Medium (CVSS 4-6): Within 1 week
- Low (CVSS 0-3): In regular releases

**What to Include:**

1. Description of the vulnerability
2. Affected versions
3. Steps to reproduce (if applicable)
4. Potential impact
5. Suggested mitigation (if you have one)

### Vulnerability Disclosure

Once a fix is prepared:

1. We'll create a patch release
2. Security advisory will be published
3. You'll be credited (unless you request anonymity)
4. Public disclosure occurs 30 days after patch release (or earlier if exploit is already public)

## Security Best Practices for Users

### Installation

```bash
# Use exact versions to ensure reproducibility
npm install -g devflow-mcp@0.1.0

# Or lock to exact version in package.json
npm install --save-exact devflow-mcp@0.1.0
```

### Configuration

- Store `.devflow/` in a directory with restricted file permissions
- Never commit `.devflow/memory/` files containing sensitive decisions
- Review and sanitize all context before sharing with team members

### Git Integration

Add to `.gitignore` if storing sensitive information:

```
# DevFlow sensitive data
.devflow/memory/activeContext.md
.devflow/memory/decisionLog.md
.devflow/memory/projectContext.md
```

### Runtime Security

- Run the MCP server in a trusted environment
- Don't expose the server to untrusted networks (currently no auth)
- Monitor file system access to `.devflow/` directories
- Keep dependencies updated (see `docs/maintenance/PINNED_VERSIONS.md`)

## Dependency Security

### Pinned Versions

All dependencies are pinned to exact versions to prevent supply chain attacks:

```json
{
	"typescript": "5.7.2",
	"eslint": "9.17.0",
	"@modelcontextprotocol/sdk": "0.7.0"
}
```

**Never use:**

- `npm install` (uses version ranges)
- `bun add package` (without `--exact`)
- `bun upgrade` (upgrades all packages)

**Always use:**

```bash
bun add --exact package@X.Y.Z --save-dev
```

See `docs/maintenance/PINNED_VERSIONS.md` for complete version strategy.

### Vulnerability Scanning

We recommend:

```bash
# Check for known vulnerabilities
npm audit
bun pm audit

# Lock file verification
bun install --frozen-lockfile
```

### Transitive Dependencies

All 232 transitive dependencies are locked in `bun.lock`. Review major version updates before committing.

## Security Updates Policy

### Patch Releases (0.1.x → 0.1.y)

- Security fixes deployed immediately
- Non-breaking changes only
- Backwards compatible

### Minor Releases (0.x → 0.y)

- New features may be added
- Breaking changes possible (pre-1.0)
- Security updates included

### Major Release (1.0.0+)

- Stability commitment
- Semantic versioning strictly followed
- Security fixes backported to 0.x branch for 12 months

## Security Auditing

### Before Production Use

1. **Code Review** - Have the codebase reviewed by security professionals
2. **Dependency Audit** - Run `npm audit` and review all findings
3. **File Permissions** - Verify `.devflow/` permissions match your security requirements
4. **Encryption** - Implement additional encryption if storing sensitive data
5. **Access Control** - Add authentication if needed for your use case

### Ongoing

- Monitor GitHub Security Advisories
- Subscribe to dependency updates via Dependabot
- Review `docs/maintenance/` for version management guidance
- Participate in community security discussions

## Future Security Enhancements

As DevFlow evolves (Phase 2+), planned security improvements include:

- Optional encryption at rest for sensitive files
- SQLite indexing with security review
- Audit logging for all operations
- Role-based access control
- Secrets management integration

## Questions?

- **Security Issues:** Use GitHub Security Advisory
- **Security Questions:** Open a GitHub Discussion
- **Documentation:** See this file for complete security guidance

---

**Last Updated:** 2024-03-20  
**Status:** Phase 1 - Foundation (Pre-Release)  
**License:** MIT
