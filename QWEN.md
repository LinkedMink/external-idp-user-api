# external-idp-user-api

NestJS-based identity provider gateway service that verifies external ID tokens (Ethereum/EIP-4361 Sign-In with Ethereum, password-based, Google) and exposes claims to internal APIs without requiring them to know the underlying identity provider.

## Tech Stack

- **Runtime:** Node.js 24 (ESM), TypeScript ^5.9.3
- **Framework:** NestJS 12
- **Database:** PostgreSQL 17 (via Prisma 7 + `@prisma/adapter-pg`)
- **Cache:** Valkey/Redis 8 (via Keyv + cache-manager)
- **Auth:** EIP-4361 (ethers.js v6), JWS signing (jose), password hashing
- **Validation:** Zod 4
- **Logging:** Winston
- **Testing:** Jest 30 + supertest, ts-jest
- **CLI:** Commander.js + `@linkedmink/node-cli-utilities`

## Project Structure

```
src/
├── app.module.ts          # Root NestJS module (global cache + config)
├── main.ts                # Bootstrap entry point (listens on LISTEN_PORT or 58080)
├── config/                # Named config factories (cache, logging, password, signing)
├── controllers/           # API route handlers
│   ├── app.controller.ts
│   ├── ethereum-login.controller.ts    # EIP-4361 Sign-In with Ethereum
│   ├── google-login.controller.ts      # Google OAuth login provider
│   ├── password-login.controller.ts    # Username/password login
│   └── users.controller.ts             # User management CRUD
├── dto/                   # Data Transfer Objects (response shapes)
├── framework/             # Cross-cutting concerns
│   ├── authentication.decorator.ts  # @AllowAnonymous()
│   ├── authentication.guard.ts      # Global auth guard (bypassed by decorator)
│   ├── claims.guard.ts              # Injects user claims into request context
│   ├── users-transform.interceptor.ts
│   └── zod-validation.pipe.ts       # Zod-based request body validation
├── interfaces/            # TypeScript interfaces
├── schemas/               # Zod schema definitions (request transformation)
└── services/
    ├── login-providers/   # Per-provider auth logic
    │   ├── ethereum-login.service.ts
    │   ├── google-login.service.ts
    │   └── password-login.service.ts
    ├── cache-logger.service.ts
    ├── password.service.ts
    ├── prisma-handlers.func.ts
    ├── prisma.service.ts
    ├── token-signing.service.ts
    ├── user-context.service.ts
    ├── user.service.ts
    └── winston-logger.service.ts
cli/                       # CLI tool (`external-idp-user-cli`) for setup + user management
config/                    # Environment files (postgres.env, api-docker.env, .env templates)
prisma/schema.prisma       # Database schema: User, UserClaim, UserToken
test/                      # E2E tests + mocks
types/                     # Shared TypeScript type definitions
```

## Database Schema

Three tables in PostgreSQL:

| Table         | Purpose                                                         |
| ------------- | --------------------------------------------------------------- |
| `users`       | Core user records with password hash/salt, lockout state        |
| `user_claims` | Key-value claims attached to users (composite PK: userId + key) |
| `user_tokens` | Login tokens per user, keyed by login method and creation time  |

## Building and Running

### Local Development

```sh
# Install dependencies
npm install

# Initialize dev configuration (creates .env + DB connection)
npx external-idp-user-cli dev

# Create an admin user
npx external-idp-user-cli user add developer@mydomain.com !tempPass1

# Start the NestJS server in watch mode
npm run start

# Start with debug port exposed
npm run start:debug    # --inspect on 0.0.0.0:9229
```

### Docker

```sh
# Build and run dev container (profile: dev)
docker compose --profile dev up --build

# Build for deployment (multi-platform: linux/amd64 + linux/arm64)
npm run build:docker

# Run production image (profile: deploy)
docker compose --profile deploy up -d
```

### CI/CD

```sh
# Lint, test, and build (run before version bumps)
npm run preversion

# Run tests in CI mode (with coverage, no interactive reporter)
npm run test:ci

# Run E2E test suite
npm run test:e2e
```

## Development Conventions

- **ESM only** — all `.ts` files compiled as ES modules; Jest moduleNameMapper strips `.js` extensions from relative imports.
- **Zod for validation** — request bodies validated via `ZodValidationPipe` with Zod schemas defined in `src/schemas/`.
- **Global guards** — `AuthenticationGuard` (skip via `@AllowAnonymous()`) and `ClaimsGuard` are applied globally at the module level.
- **Winston logger** — replaces NestJS default ConsoleLogger via provider override throughout the app.
- **Prisma** — schema lives in `prisma/schema.prisma`; client generated on prebuild (`prisma generate`). PostgreSQL is the only supported database (multi-DB marked as TODO).
- **Husky + lint-staged** — Git hooks enforce formatting and linting on commit.
- **ESLint** — uses `@linkedmink/eslint-config` with TypeScript ESLint flat config; module files exempted from `no-extraneous-class`.
- **Prettier** — formats all `.ts` files in `src/` and `test/`.

## Dependency Update Rules

When updating dependencies, follow this procedure:

1. **Run `npm update` first**, then check `npm outdated` for targets.
2. **Exclude `@types/*` packages** from major version bumps (they track TypeScript versions).
3. **Use caret ranges** (`^X.Y.Z`) — never pin exact versions.
4. **After install**, run `npm run preversion` (lint + test:ci + build) before proceeding.
5. **Fix breaking changes** incrementally — do not batch multiple major bumps together.

### Known compatibility constraints

- **typescript-eslint v8** requires `eslint ^8.57.0 || ^9.0.0 || ^10.0.0` AND `typescript >=4.8.4 <6.1.0`. Use `typescript-eslint ^8.63.0+` for ESLint 10 support. TypeScript 7 is blocked until typescript-eslint v9 is released.
- **Prisma 7** requires `prisma.config.ts` for datasource configuration (connection URLs and adapters); the `url` property is removed from `schema.prisma`. Use `@prisma/adapter-pg` with `PrismaPg` class — pass `{ adapter: new PrismaPg({ connectionString }) }` to the PrismaClient constructor. The `$on` method requires a type assertion when extending PrismaClient because the generic log event type defaults to `never`.
- **NestJS 12 is ESM-only** — `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, and `@nestjs/testing` ship `"type": "module"` with no CJS build (`@nestjs/config` and `@nestjs/cache-manager` remain dual). The app itself builds to ESM via `nest build` and runs fine under Node 24; only the Jest CJS runtime is affected.
- **Jest runs with `--experimental-vm-modules`** — the test scripts in `package.json` set `NODE_OPTIONS="--experimental-vm-modules --disable-warning=ExperimentalWarning"`. This exposes `vm.SourceTextModule`, which Jest 30 requires for its native `require(esm)` fallback (Node 24.9+) so CJS-compiled test files can load the ESM-only packages. Do NOT add `transformIgnorePatterns` exceptions for ESM-only `node_modules` packages (e.g., `@linkedmink/eip-4361-parser`, `apg-lite`): ts-jest's CJS output evaluated in an ESM scope fails with `ReferenceError: exports is not defined`. They load natively now.
- **Subpath imports** (`package/subpath`) need both `moduleNameMapper` in `jest.config.js` and matching paths in `test/tsconfig.json` — always verify the actual file location in the package's `exports` field.

## Key Configuration

| Env Var        | Purpose                             |
| -------------- | ----------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string        |
| `LISTEN_PORT`  | HTTP server port (default: 58080)   |
| `REDIS_URL`    | Valkey/Redis connection for caching |
| `JWS_KEY_PATH` | Path to JWS signing key (secp521r1) |
| `PASSWORD_*`   | Password policy settings            |

Configuration is loaded via NestJS `ConfigModule` with named config factories (`cacheConfigLoad`, `loggingConfigLoad`, `passwordConfigLoad`, `signingConfigLoad`).

## Notes for AI Assistance

- The project uses **ESM** exclusively; never suggest CommonJS (`require`, `module.exports`) patterns.
- Relative imports must retain the `.js` extension even in `.ts` files (TypeScript/ESM requirement).
- The `postversion` npm script auto-skips Docker rebuild on non-prerelease versions.
- The CLI (`cli/`) is a separate entry point using `tsx` for direct TypeScript execution.
- Google login provider exists but may be a stub or incomplete — check implementation before modifying.
- **Dependency updates** — see "Dependency Update Rules" section above for the full procedure and known compatibility constraints.
