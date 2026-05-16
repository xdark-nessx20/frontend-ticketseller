# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server with HMR
npm run build      # tsc -b && vite build
npm run lint       # ESLint on all files
npm run preview    # Serve production build locally
```

All npm commands must be run from the project root: `/home/nestor/Programacion/Ing_Software/frontend-ticketseller`.

**Do NOT proactively run `npm run dev`, `npm run build`, or `npm run lint` unless the user explicitly asks.** Never start the dev server to test UI changes. Do NOT ask the user to confirm npm command paths.

No test runner is installed yet. The plans call for Vitest + React Testing Library + MSW — install them before writing tests.

## Planned Dependencies (not yet installed)

The implementation plans assume these packages will be added:

- `@tanstack/react-query` v5 — server state (queries/mutations)
- `zustand` — client-side UI state (filters, cart)
- `axios` — HTTP client
- `react-router-dom` v6 — routing
- `react-hook-form` + `zod` — form validation
- `vitest` + `@testing-library/react` + `msw` — testing

Install them as each feature is implemented.

## Architecture

**Type:** Admin Panel + Customer Portal SPA for an event ticketing system.

**Feature-based folder structure** — each feature owns everything it needs:

```
src/
├── types/           # TypeScript interfaces/enums per feature (e.g. recinto.types.ts)
├── services/        # Axios API functions per feature (e.g. recintosService.ts)
├── stores/          # Zustand stores for client state (filters, UI toggles)
├── hooks/
│   └── <feature>/   # TanStack Query hooks (useRecintos, useCreateRecinto, etc.)
├── pages/
│   └── <feature>/   # Full page components
└── components/
    └── <feature>/   # Reusable components scoped to that feature
```

**State management split:**
- TanStack Query handles all server state — use `['resource', filters]` as query keys; mutations must invalidate the affected query keys in `onSuccess`.
- Zustand handles client-only state — active filters, pagination, UI toggles. One store per feature.

**Routing:** Admin pages at `/admin/<feature>/*`, customer portal at `/`.

**Forms:** React Hook Form for state + Zod schemas for validation. No inline validation logic.

## Coding Standards (from implementation plans)

- No comments unless the code cannot express the context alone.
- `interface` for objects and props; `type` for unions and primitives.
- Functional components only.
- Business logic lives in custom hooks — components only render.
- Tailwind classes only, no inline styles.
- No soft deletes UI — venues can only be deactivated, not deleted. Capacity changes are blocked when tickets are sold.

## Implementation Plans

Detailed phased plans for all 12 features live in `docs/plan/`. Each plan includes file structure, user stories broken into tasks with checkboxes, MSW-based test cases, and checkpoint validations. Read the relevant plan before starting any feature.

| Plan | Feature | Depends On |
|------|---------|------------|
| 001 | Control de Recintos (Venues) | — foundational |
| 002 | Catálogo de Asientos | 001 |
| 003 | Mantenimiento de Recinto | 001, 002 |
| 004 | Checkout y Pago | 001, 002, 012 |
| 005 | Post-Venta y Devoluciones | 004 |
| 006 | Control de Acceso | 004 |
| 007 | Gestión de Transacciones | 005, 006 |
| 008 | Inventario IRL | 001–003 |
| 009 | Bloqueos y Cortesías | 001 |
| 010 | Campañas y Descuentos | 012 |
| 011 | Liquidación y Dispersión | 005–007 |
| 012 | Gestión de Eventos | 001 |

Start with 001 — it is a hard prerequisite for everything else.
