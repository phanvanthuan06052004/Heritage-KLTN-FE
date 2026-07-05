# Example CLAUDE.md — React/TypeScript Project

This example shows a complete `CLAUDE.md` for a React application built with TypeScript, using Vite as the build tool, Vitest for testing, and ESLint/Prettier for code quality. It covers the conventions a team would want Claude Code to follow consistently — including the *why* behind each rule, so Claude can generalize correctly to cases the doc doesn't explicitly cover.

## The CLAUDE.md File

````markdown
# Project: Acme Dashboard

React 19 + TypeScript 5.x single-page application. Vite build system.
Internal analytics dashboard used by ~200 employees. Correctness and
accessibility matter more than bundle size here — this is not a
public marketing site.

## Commands

- `npm run dev` — start dev server (port 3000)
- `npm run build` — production build
- `npm run test` — run all tests with Vitest
- `npm run test -- --run src/components/Button.test.tsx` — run a single test file
- `npm run test:e2e` — run Playwright end-to-end tests (requires `npm run dev` running separately)
- `npm run lint` — ESLint + Prettier check
- `npm run lint:fix` — auto-fix lint issues
- `npm run typecheck` — tsc --noEmit
- `npm run storybook` — launch Storybook on port 6006

Always run `npm run typecheck && npm run lint && npm run test` before
opening a PR. If any of these fail, fix them before proceeding —
do not comment them out or add `--no-verify`.

## Architecture

```
src/
├── components/    # reusable, feature-agnostic UI (Button, Modal, Table)
├── features/      # feature modules (auth, dashboard, settings)
│   └── auth/
│       ├── components/
│       ├── hooks/
│       ├── api.ts
│       └── types.ts
├── hooks/         # shared custom hooks used across features
├── api/           # API client, base fetch wrapper, shared request/response types
├── types/         # shared TypeScript types and interfaces
├── stores/        # Zustand global stores
└── utils/         # pure utility functions (no side effects, no React)
```

Rule of thumb: if a component, hook, or type is used by more than one
feature, it belongs in `src/components`, `src/hooks`, or `src/types` —
not duplicated inside a feature folder.

## Component Conventions

- Functional components only — no class components.
- Use named exports, not default exports (enables consistent
  auto-import naming and better refactor tooling).
- Co-locate tests: `Button.tsx` → `Button.test.tsx` in the same directory.
- Co-locate styles: `Button.tsx` → `Button.module.css` (CSS Modules).
- Props interface named `{Component}Props` — e.g., `ButtonProps`.
- Destructure props in the function signature.
- Every interactive element must be keyboard-accessible and carry the
  correct ARIA role/label — this is an internal tool used with screen
  readers by some employees, not a nice-to-have.

```tsx
// Good
export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button className={styles[variant]} onClick={onClick}>
      {label}
    </button>
  );
}

// Avoid: default export, inline style, no props type
export default function Button(props: any) {
  return <button style={{ color: 'blue' }} onClick={props.onClick}>{props.label}</button>;
}
```

## State Management

- Local state: `useState`/`useReducer`.
- Server state: TanStack Query (React Query) — never store API data in
  local state, and never re-fetch manually in a `useEffect` when a
  query hook can do it.
- Global app state: Zustand stores in `src/stores/`, one store per domain
  (e.g. `useAuthStore`, `useUiStore`). Do not put server data in Zustand.
- No Redux — do not introduce Redux or Redux Toolkit.
- Derived values should be computed inline or with `useMemo`, not
  duplicated into their own state variable.

## Data Fetching & API Layer

- All HTTP calls go through `src/api/client.ts` (a thin `fetch` wrapper
  with auth headers and error normalization already applied). Do not
  call `fetch` directly from components or hooks.
- Every endpoint has a typed function in the relevant feature's `api.ts`
  and a matching request/response type in `src/api/types.ts` or the
  feature's local `types.ts`.
- Wrap query/mutation logic in a custom hook (`useUserQuery`,
  `useUpdateSettingsMutation`) rather than calling `useQuery` directly
  inside components — this keeps query keys and cache invalidation
  centralized and testable.
- Handle loading and error states explicitly in the UI; do not silently
  swallow errors or leave a blank screen on failure.

## TypeScript

- Strict mode enabled — do not use `any` unless absolutely necessary,
  and always with a comment explaining why.
- Prefer `interface` over `type` for object shapes; use `type` for
  unions, intersections, and utility-type compositions.
- Use discriminated unions for state machines and complex state
  (e.g. `{ status: 'idle' | 'loading' | 'error' | 'success' }` with a
  matching `data`/`error` field per branch), not a pile of optional
  booleans.
- API response types live in `src/api/types.ts` and should be inferred
  from the backend's OpenAPI schema when possible, not hand-written
  from memory.

## Testing

- Use Vitest + React Testing Library.
- Test behavior, not implementation — query by role, text, or test ID,
  never by CSS class or component internals.
- Every component should have at least a smoke test (renders without
  crashing) plus one test per meaningful interaction or state branch.
- Mock API calls with MSW (Mock Service Worker), not `jest.mock` —
  this keeps tests closer to real network behavior.
- Place shared test utilities in `src/test/helpers.ts`.
- New behavior requires a new or updated test in the same PR — do not
  ship a feature and defer tests to a follow-up.

## Error Handling

- Wrap each top-level route in an error boundary (`src/components/ErrorBoundary.tsx`);
  do not let a single feature crash the whole app.
- User-facing errors get a readable message; log the technical detail
  to the console/monitoring service, never show a raw stack trace or
  error object to the user.
- Network errors from the API client are typed (`ApiError`) — check for
  this type before assuming an error shape.

## Git

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`.
- Branch naming: `feature/`, `fix/`, `chore/`.
- Always create a PR — never push directly to `main`.
- Keep PRs focused on one change; do not mix refactors with feature work
  in the same PR.

## When Unsure

- If a requested change conflicts with a rule in this file, stop and
  ask rather than silently overriding the convention.
- If a task requires a new dependency, a new global store, or a change
  to the folder structure, flag it explicitly instead of proceeding —
  see "Do NOT" below.
- If existing code in the file you're editing violates these
  conventions, follow the existing local pattern for minimal edits, but
  mention the inconsistency rather than silently fixing unrelated code.

## Do NOT

- Do not use `any` without a justifying comment.
- Do not add new dependencies without discussing first.
- Do not use inline styles — use CSS Modules.
- Do not use default exports.
- Do not call `fetch` directly outside `src/api/`.
- Do not introduce Redux, MobX, or any state library beyond
  Zustand + TanStack Query.
- Do not disable ESLint rules or TypeScript errors with inline comments
  (`// eslint-disable-next-line`, `// @ts-ignore`) without a comment
  explaining why, and prefer fixing the root cause first.
```

## Key Sections Explained

**Project header** — One or two lines of context (what the app is, who
uses it, what tradeoffs matter) help Claude make judgment calls in
situations the explicit rules don't cover — e.g. knowing accessibility
matters more than bundle size here changes how Claude weighs a decision.

**Commands** — Lists exact commands so Claude can run tests, linting,
and type checks without guessing. The single-test example is especially
useful since the syntax varies across test runners. Naming the full
pre-PR command sequence removes ambiguity about "when am I done."

**Architecture** — A folder tree plus a placement rule ("if used by more
than one feature, it belongs in X") lets Claude decide *where new code
goes*, not just where existing code is.

**Component Conventions** — Ensures Claude generates components matching
team style: named exports, co-located tests, CSS Modules, the props
naming pattern, and accessibility requirements. A paired good/bad
example does more work than either rule alone.

**State Management** — Prevents Claude from introducing Redux or
misusing local state for server data. These are the kinds of
architectural decisions Claude cannot infer on its own.

**Data Fetching & API Layer** — Without this, Claude will happily call
`fetch` inline or duplicate query logic per component. Naming the exact
file (`src/api/client.ts`) removes any guesswork.

**TypeScript** — Goes beyond "use strict mode" to show *how* to model
state correctly (discriminated unions vs. boolean soup), which is where
generated code quality most often breaks down.

**Testing** — Specifies not just the tools but the testing philosophy
(behavior over implementation) and the process rule (tests ship with
the feature, not after).

**Error Handling** — A commonly missing section. Without it, Claude has
no default for where error boundaries go or what a user should ever see
on failure.

**When Unsure** — Gives Claude an explicit escape hatch: ask or flag
instead of guessing and silently making an architectural decision.

**Do NOT** — Explicit guardrails for things the team has agreed to
avoid. Claude respects these consistently, especially when paired with
the reasoning above rather than left as a bare list.

## See Also

- [CLAUDE.md Setup Guide](../guides/claude-md-guide.md) — how to structure your own CLAUDE.md
- [Minimal Example](./claude-md-minimal.md) — a simpler starting point
- [Monorepo Example](./claude-md-monorepo.md) — for projects with multiple packages
