# virtual-art-api — Backend CLAUDE.md

## Product Context

Virtual Art is a platform for artists to create and publish virtual 3D exhibitions. Each artist manages their own expos (rooms), artworks (paintings & sculptures), and benches. The API is the backend for the `virtual-art-web-client`.

## Stack

- **Runtime**: Node.js (CommonJS / `tsc`)
- **Framework**: Fastify v4
- **JWT**: `fastify-jwt` v4 (legacy package — NOT `@fastify/jwt`)
- **Validation**: Zod + `fastify-zod` (`buildJsonSchemas`)
- **ORM**: Prisma 6, client generated at `src/generated/prisma`
- **Dev**: `tsx watch`, TypeScript 5.8
- **Docs**: Swagger at `/docs`
- **Email**: Resend (prod) → SMTP → console fallback (dev)

## Directory Structure

```
src/
  app.ts           # buildServer() — plugins, routes, error handler
  index.ts         # Entry point (port 3010)
  modules/
    auth/          # Register, activate, request-activation, login, logout, me
    expo/          # Expo CRUD (+ expo.mapper.ts for row → response shape)
    artwork/       # Artwork CRUD nested under expo (+ artwork.mapper.ts)
    bench/         # Bench CRUD nested under expo
    user/          # GET/PATCH /users/me
  utils/
    cookies.ts     # getCookie, setCookie, clearCookie
    errors.ts      # ConflictError, NotFoundError, UnauthorizedError
    hash.ts        # hashPassword, verifyPassword (PBKDF2-sha512)
    prisma.ts      # Prisma singleton
    mailer.ts      # Resend / SMTP / console fallback
  types/
    fastify-jwt.d.ts   # Ambient override (fastify-jwt@4 is untyped)
prisma/
  schema.prisma
  seed.ts          # Creates a demo artist account (dev only)
  migrations/
```

## API Route Prefixes

| Module   | Prefix                            |
| -------- | --------------------------------- |
| auth     | `/api/auth`                       |
| expo     | `/api/expos`                      |
| artwork  | `/api/expos/:expoId/artworks`     |
| bench    | `/api/expos/:expoId/benches`      |
| user     | `/api/users`                      |

## JWT Payload (`request.user`)

```typescript
{
  userId: string;
  email: string;
}
```

Cookie name: `access_token` (httpOnly, SameSite=Strict, 1-day expiry).

## Authentication

No RBAC. Routes are either:
- **Public** — no preHandler (GET expo, GET artworks, etc.)
- **Authenticated** — `preHandler: [app.authenticate]`

Ownership checks are done in service functions using `assertExpoOwnership(expoId, userId)`.

## Module Structure Pattern

Each module has 4 files (+ optional mapper):

```
modules/{name}/
  {name}.schemas.ts    # Zod schemas → buildJsonSchemas() → { schemas, $ref }
  {name}.service.ts    # Pure functions with Prisma queries, throws AppError subclasses
  {name}.controller.ts # FastifyRequest handlers, calls service, sends reply
  {name}.routes.ts     # async function(app) { app.get/post/... }
  {name}.mapper.ts     # Maps Prisma row → response shape (expo, artwork)
```

## Domain Models

```
User ──< Expo ──< Artwork
              ──< Bench
```

- **User**: artist account (email, password, activation flow)
- **Expo**: virtual exhibition with room config, spawn, frame defaults
- **Artwork**: painting (wall placement + procedural) or sculpture (position + 3D)
- **Bench**: seating in the expo room

### Enum values (Prisma → API response)

| Domain   | Prisma enum values                                               |
|----------|------------------------------------------------------------------|
| WallId   | NORTH, SOUTH, EAST, WEST, CENTER_NORTH, CENTER_SOUTH            |
| ProceduralStyle | COLOR_FIELD, BAUHAUS, FLOW, ORBITS, HORIZON, GRID, STRATA |
| SculptureShape  | KNOT, MONOLITH, SPHERES                                  |
| ArtworkType     | PAINTING, SCULPTURE                                      |

## Error Handling

Throw from `src/utils/errors.ts`:

```typescript
throw new NotFoundError("Expo not found.");    // → 404
throw new ConflictError("Slug already in use."); // → 409
throw new ForbiddenError("Access denied.");    // → 403
throw new UnauthorizedError("Bad credentials."); // → 401
```

## Mapper Pattern

Expo and Artwork rows are flattened in DB (individual columns for room dims, frame, etc.) and mapped to nested response objects via `{name}.mapper.ts`. Always use the mapper — never return raw Prisma rows.

## Seed

```bash
npm run seed
```

Creates `demo@virtual-art.app` / `Dev@1234567890!` (dev only, skipped in production).

## CORS Origins

- `http://localhost:5173`
- `http://localhost:3000`
- `https://virtual-art.motalei.com`
- `https://www.virtual-art.motalei.com`

## Port

API runs on **3010** (not 3000, to avoid conflict with verdana-api).
