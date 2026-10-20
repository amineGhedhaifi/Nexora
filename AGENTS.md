# Nexora — Project Instructions

## Project Overview

Nexora is a full-stack e-commerce application.

The application supports guest users and authenticated clients.
Online payment processing is not implemented.

## Technology Stack

### Frontend

- React
- TypeScript

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM 7
- Neon PostgreSQL
- Zod for validation

## Project Structure

- `frontend/`: React application.
- `backend/`: Express API and backend logic.
- `backend/prisma/`: Prisma schema and database-related files.
- `backend/prisma/models/`: Prisma model definitions.

Always inspect the actual project structure before assuming
the location or name of a file.

## Architecture and Coding Conventions

- Follow the existing architecture and naming conventions.
- The backend uses a feature-based structure.
- Keep routes, controllers, services, schemas, and middleware
  separated according to existing patterns.
- Reuse existing utilities, types, hooks, components, and services.
- Avoid duplicating existing functionality.
- Use Prisma for database access.
- Use Zod for request validation where appropriate.
- Keep TypeScript types accurate and avoid `any` unless justified.
- Keep changes focused on the requested task.

## Business Rules

- Guest users can maintain a shopping cart and place orders.
- Authenticated clients can use their accounts.
- Online payments are not supported.
- Order statuses are ordered, shipping, and delivered.
- Product images use local storage.

Preserve these requirements unless explicitly instructed otherwise.

## Working with the Codebase

Before implementing a feature:

1. Identify the relevant files and existing implementation.
2. Inspect the dependencies that could be affected.
3. Reuse existing patterns and abstractions where appropriate.
4. Identify any database, API, or frontend changes required.
5. Ask for clarification if a significant requirement is ambiguous.

Do not explore unrelated parts of the repository.

Do not rewrite working functionality or introduce unnecessary
dependencies without a clear reason.

Do not assume a feature is missing before searching for it.

## Making Changes

- Make changes directly in the relevant existing files.
- Avoid modifying unrelated files.
- Preserve existing behavior unless the task requires changing it.
- Do not replace established architectural patterns without justification.
- Never expose secrets, credentials, or environment variable values.
- Do not modify environment files or perform destructive database
  operations unless explicitly authorized.

## Verification

After implementing a change:

- Run the relevant tests when available.
- Run the appropriate TypeScript checks.
- Run the relevant build command when appropriate.
- Report any checks that could not be completed.
- Do not claim that a check passed unless it was actually executed.

## Communication

Before making substantial changes, briefly explain the implementation plan.

After completing a task, summarize:

- What changed.
- Which files were modified.
- Which checks were performed.
- Any remaining issues or limitations.
