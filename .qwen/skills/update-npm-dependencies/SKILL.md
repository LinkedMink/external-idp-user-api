---
name: update-npm-dependencies
description: Update all dependencies in a TypeScript project's `package.json` to their latest major versions, then build and lint the application.
user-invocable: true
---

# Update NPM Dependencies to Latest Major Versions

## Prerequisites

- Read `QWEN.md` for project context (Node.js version, dependency patterns, module system)
- Read `package.json` to identify current dependency versions

## Workflow

### 1. Update minor versions

```bash
npm update
```

### 2. Identify target dependencies

```bash
npm outdated
```

Check npm registry for each dependency's latest major version. Focus on major version bumps that are safe and intentional. **Exclude `@types/*` packages** — they must match the major version of their target dependency (e.g., `@types/node` stays on Node.js 24.x unless the Node.js target changes).

### 3. Update package.json

Update each target dependency to its latest major version using caret ranges:

- `"redis": "^5.6.1"` → `"redis": "^6.0.0"`
- `"typescript": "^5.6.3"` → `"typescript": "^6.0.0"`
- `"mongoose": "^8.5.2"` → `"mongoose": "^9.0.0"`

### 4. Install and verify

```bash
npm install
npm run build
npm run lint
npm run test:ci
```

### 5. Fix breaking changes

Major version bumps often introduce breaking type changes.

### 6. Update prerelease version

```bash
npm --no-git-tag-version version prerelease
```

### 7. Verification checklist

- [ ] `npm run build` passes cleanly (TypeScript compilation succeeds)
- [ ] `npm run lint` passes cleanly (ESLint v10 rules satisfied)
- [ ] `npm run test:ci` passes cleanly (Jest unit tests succeed)
- [ ] QWEN.md updated with dependency rules
