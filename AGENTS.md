# AGENTS.md — Ecommerce Admin Project

## Project Overview
Next.js 15 app with a dual-route architecture:
- **Public Storefront**: Located in `src/app/(store)` (served at `/`).
- **Admin Dashboard**: Located in `src/app/admin` (served at `/admin`).

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4, Framer Motion
- **Database**: Prisma ORM
- **Icons**: Lucide React
- **Package Manager**: pnpm

## Common Commands
- `pnpm run dev` — Start development server
- `pnpm run build` — Build for production
- `pnpm run db:push` — Sync Prisma schema with DB
- `pnpm run db:studio` — Open Prisma Studio
- `npx prisma generate` — Regenerate Prisma client

## Coding Guidelines
- **Logic**: Use Server Components by default; "use client" only when needed for interactivity.
- **Styling**: Use Tailwind 4 utility classes. Prefer CSS variables for theme colors if defined.
- **TypeScript**: Strict typing. Avoid `any`. Use interfaces for data models.
- **Components**: Functional components only. Use `lucide-react` for icons.
- **State**: Use URL state or React 19 hooks for local state.

## Interaction Rules (Token Saving)
- **Be Concise**: Skip introductory and concluding pleasantries.
- **Code Only**: If a task is clear, provide the code/diff directly without explaining obvious steps.
- **Incremental Edits**: Use diff-style blocks or focus only on the modified parts of a file.
- **Context**: Assume I know the project structure; don't repeat paths unless necessary.
- **Errors**: If a command fails, just show the fix.
