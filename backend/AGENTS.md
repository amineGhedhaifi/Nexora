# Backend Instructions

## Architecture

The backend uses Express, TypeScript, Prisma ORM 7, Neon PostgreSQL,
and Zod for request validation.

The codebase follows a modular, feature-based architecture.
Each feature should be implemented within its own module.

Before creating or modifying a module, inspect the existing modules
and follow their established structure and conventions.

## Module Structure

Each module contains the following components:

- `schema.ts`: Defines and validates input data using Zod.
- `service.ts`: Contains business logic and database operations.
- `controller.ts`: Handles HTTP requests and responses.
- `router.ts`: Defines the module's API endpoints and connects
  routes to their corresponding controllers and middleware.

Keep responsibilities separated between these components.

### Schemas

- Use Zod to validate incoming request data.
- Reuse schemas when appropriate.
- Infer TypeScript types from Zod schemas when practical.
- Do not duplicate validation logic unnecessarily.

### Services

- Keep business logic in services rather than controllers.
- Use Prisma for database operations.
- Handle database-related errors appropriately.
- Avoid mixing HTTP-specific request and response handling
  into the service layer.

### Controllers

- Extract validated input from the request.
- Call the appropriate service.
- Return consistent HTTP responses.
- Forward errors to the established error-handling middleware.
- Avoid placing substantial business logic in controllers.

### Routers

- Define endpoints using Express routers.
- Connect routes to the appropriate controllers.
- Apply relevant middleware to protected endpoints.
- Follow the existing route naming and HTTP method conventions.

## Prisma and Database

- Prisma models are defined in `prisma/models/`.
- Follow the existing Prisma schema organization.
- Use Prisma Client for database operations.
- Do not access the database directly from controllers.
- Preserve existing model relationships and constraints.
- Update related code when changing a model, including validation
  schemas, services, and response types where necessary.
- Do not run destructive database operations without authorization.

## Middleware

Middleware is organized separately from feature-specific business logic.

Before creating new middleware, inspect the existing middleware
and determine whether it can be reused.

### Authentication

- Use the existing authentication middleware to identify
  authenticated users.
- Do not duplicate token verification in controllers or services.

### Authorization

- Use the existing authorization middleware to enforce role-based
  access control.
- Authentication and authorization are separate responsibilities.
- Do not rely on frontend restrictions to enforce permissions.

### Validation

- Reuse existing validation middleware where available.
- Validate incoming request data before it reaches business logic.

### Error Handling

- Follow the existing error-handling strategy.
- Forward errors to the centralized error-handling middleware
  where applicable.
- Do not expose stack traces, secrets, or sensitive internal
  details in production responses.

### Other Middleware

Inspect existing middleware before adding functionality such as
CORS, rate limiting, security headers, logging, or request parsing.

Avoid duplicating middleware already configured at the application level.

## TypeScript

- Preserve strict typing and existing TypeScript conventions.
- Avoid `any` unless there is a clear justification.
- Reuse existing types and infer types from Zod schemas when appropriate.
- Keep request, response, and service types consistent.

## Adding or Modifying Features

Before implementing a feature:

1. Inspect the relevant module and its dependencies.
2. Inspect related Prisma models and existing middleware.
3. Follow established patterns from comparable modules.
4. Identify affected schemas, services, controllers, routers,
   and database models.
5. Make only the changes necessary for the requested feature.
6. Run relevant TypeScript checks and tests when available.

Do not introduce new architectural patterns or dependencies
without a clear reason.

Do not assume that a file or functionality is missing before
inspecting the existing implementation.
