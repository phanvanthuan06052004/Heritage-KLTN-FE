# UI/UX Historical Theme Implementation Guide

## Purpose

This document is the source of truth for LLM agents working on the UI/UX refresh of this website.

The goal is to make the entire product feel like a Vietnamese historical heritage platform: readable, accessible, calm, premium, and consistent with a museum/archive visual language.

Primary goals:

- Improve color contrast across the full website.
- Align all UI surfaces with the historical/museum theme.
- Improve the header, footer, chatbot, map, auth, listing, detail, passport, trip, and chat flows.
- Add clear loading, empty, and error states where missing.
- Improve responsive behavior and avoid overlapping controls on mobile.
- Optimize performance without adding dependencies.

## Project Reality

The original prompt may mention React + TypeScript + CSS Modules, but this repository currently uses:

- Vite React
- JavaScript / JSX
- Tailwind CSS
- Redux Toolkit / RTK Query
- React Router
- Existing museum design tokens in `src/index.css` and `tailwind.config.js`

Follow the current project conventions unless the user explicitly requests a migration.

Do not add new dependencies unless the user approves them first.

## Source Files To Read First

Read these before changing UI:

- `D:\Nam\plan.MD`
- `src/index.css`
- `tailwind.config.js`
- `src/components/common`
- `src/components/NavBar`
- `src/components/Footer`
- `src/components/GlobalChatbot`
- `src/routes/index.jsx`
- `src/routes/publicRoutes.jsx`

## Historical Visual Direction

The product should feel like a digital museum archive, not a generic SaaS dashboard.

Use this mood:

- Dark lacquered wood.
- Aged parchment.
- Bronze and muted gold accents.
- Imperial seal red.
- Jade green as a secondary accent.
- Soft archival lighting.
- Elegant typography hierarchy.
- Calm, subtle interactions.

Avoid:

- Bright cyan AI styling.
- Pure white cards on dark museum pages.
- Random blue/emerald SaaS colors unless semantically necessary.
- Excessive glow or neon effects.
- Oversized floating controls.
- Low-contrast muted text on dark backgrounds.
- Generic dashboard visuals that ignore the heritage theme.

## Existing Palette

Prefer existing tokens before introducing new colors.

| Token | Use |
|---|---|
| `museum-black` | Main dark background |
| `museum-charcoal` | Secondary dark background |
| `museum-espresso` | Warm dark surface |
| `museum-ivory` | Main light text on dark |
| `museum-parchment` | Paper surface or softer light text |
| `museum-gold` | Primary accent, borders, CTA fill |
| `museum-gold-light` | Highlight text on dark |
| `museum-seal` | Imperial red, strong brand accent |
| `museum-terracotta` | Warm secondary accent |
| `museum-terracotta-light` | Warning/error text on dark |
| `museum-jade` | Success, verified, historical map accent |
| `museum-muted` | Secondary text only when contrast is safe |

## Contrast Rules

WCAG AA is required for normal text.

Rules:

- On dark backgrounds, primary text should use `text-museum-ivory`.
- On dark backgrounds, secondary text should use `text-museum-parchment/80` or stronger.
- Avoid `text-museum-muted` for small text on very dark backgrounds if it looks dim.
- On parchment or ivory surfaces, use espresso, seal, or terracotta for text.
- Do not use `museum-gold` or `museum-gold-light` as small text on ivory/parchment.
- Do not use `museum-seal` as small text directly on `museum-black`.
- Gold should mostly be an accent, border, CTA fill, icon, or large display treatment.
- Error text on dark surfaces should use a light warm color, not dark seal red.

Known contrast risks:

- `museum-muted` on ivory/parchment is too weak for normal text.
- `museum-gold` and `museum-gold-light` on ivory/parchment are too low contrast for small text.
- `museum-seal` on `museum-black` is too dark for small error text.

## Global UI Rules

Apply these rules across the site:

- Use existing Tailwind and museum tokens before adding new colors.
- Keep component APIs unchanged unless absolutely necessary.
- Do not introduce new dependencies.
- Use transitions around `duration-150` to `duration-200` for hover/focus/state changes.
- Avoid flashy animation.
- Respect `prefers-reduced-motion` for JS, canvas, map, and Framer animations.
- Every custom interactive element must be keyboard accessible.
- Every button-like control should be a real `button` or accessible link.
- Every modal/dialog should have a clear label, close control, and visible focus state.
- Mobile width must not create horizontal scroll or overlapping fixed controls.
- Loading, empty, and error states must be explicit.

## Common Component Foundation

Inspect and fix these first:

- `src/components/common/ui/Button.jsx`
- `src/components/common/ui/Input.jsx`
- `src/components/common/ui/Card.jsx`
- `src/components/common/ui/Avatar.jsx`

Important issue:

Some classes use raw CSS variables such as `var(--foreground)` even though global tokens are HSL components. Raw HSL components are not valid CSS colors unless wrapped with `hsl(var(--token))`.

Required changes:

- Prefer Tailwind tokens like `text-foreground`, `bg-card`, `border-input`, `bg-heritage`.
- If arbitrary values are required, use `hsl(var(--token))`.
- Do not use invalid classes like `bg-[color:var(--token)]` for HSL component tokens.

Acceptance criteria:

- Shared UI components render colors consistently.
- Common controls have visible `focus-visible` states.
- No common component uses invalid CSS color syntax.

## Focus States

Use a consistent museum focus style for custom controls.

Preferred focus style:

- `focus-visible:outline-2`
- `focus-visible:outline-offset-2`
- `focus-visible:outline-museum-gold-light`

Use the existing `.museum-focus` utility where appropriate.

Focus must be visible on:

- Navbar links and buttons.
- Search input and clear/search buttons.
- Language switcher.
- User menu.
- Footer links and social icons.
- Chatbot launcher and panel controls.
- Map controls.
- Modal buttons.
- Form inputs.

## Header Requirements

Files:

- `src/components/NavBar/NavBar.jsx`
- `src/components/NavBar/NavLinks.jsx`
- `src/components/NavBar/MobileMenu.jsx`
- `src/components/NavBar/SearchBar.jsx`
- `src/components/NavBar/LanguageSwitcher.jsx`
- `src/components/NavBar/UserMenu.jsx`

Current issue:

- Header text can sink into the hero image because the unscrolled navbar background is too transparent.
- Some nav text is too muted.
- Mobile menu focus/hover states should be more consistent.

Required changes:

- Increase default navbar dark scrim.
- Add a subtle border or bottom divider for separation.
- Use readable ivory text for nav links.
- Use museum gold for active and hover states.
- Search input must remain readable over the dark header.
- Mobile menu should use the same museum palette.
- Preserve or add `aria-expanded`, `aria-label`, and visible focus outlines.

Acceptance criteria:

- Header text is readable on bright and dark hero images.
- Active page is obvious.
- Keyboard focus is visible on all navbar controls.
- Mobile menu is readable and does not trap or hide controls incorrectly.

## Footer Requirements

Files:

- `src/components/Footer/Footer.jsx`
- `src/components/Footer/SocialIcon.jsx`

Current issue:

- Footer can feel too bright in accents and social/link areas.
- Decorative pattern and gold divider can compete with content.

Required changes:

- Keep footer dark and grounded.
- Reduce overly bright backgrounds and pattern opacity.
- Use gold for headings, divider, and hover/focus accents only.
- Footer body copy should be readable but visually quieter than headings.
- Social icons need clear hover and focus states.

Acceptance criteria:

- Footer feels like a museum/archive ending section.
- Links are readable and keyboard accessible.
- Visual brightness is calmer than hero and CTA sections.

## Global Chatbot Requirements

File:

- `src/components/GlobalChatbot/GlobalChatbot.jsx`

Current issues:

- Floating AI robot is too large.
- Chatbot uses bright white, cyan, stone, and emerald colors that do not match the historical theme.
- Chatbot appears on dense/fullscreen routes where it can block controls.
- The chatbot pulls heavy 3D/motion code into the app globally.

Required visual changes:

- Reduce launcher size.
- Reduce tooltip size and visual weight.
- Replace cyan/white/stone styling with museum palette.
- Use parchment and dark museum surfaces instead of generic white panels.
- Keep AI identity clear but make it feel like a heritage archive assistant.
- Loading, error, source, evidence, welcome, and follow-up states must share the same theme.

Recommended route hiding:

| Route pattern | Reason |
|---|---|
| `/chat/heritage/` | Dedicated chat already exists |
| `/admin` | Admin layout has dense controls |
| `/login` | Auth focus should not be interrupted |
| `/register` | Auth focus should not be interrupted |
| `/explore` | Map controls can overlap |
| `/historical-map` | Map/graph controls can overlap |
| `/passport/track` | Live tracking needs uncluttered UI |

Performance direction:

- Make the default global entry a lightweight launcher.
- Load chatbot panel and 3D robot only after user intent or idle.
- Consider using a simpler SVG/CSS launcher if 3D is too expensive.

Acceptance criteria:

- Launcher does not cover important mobile content.
- Chatbot panel feels historical/museum themed.
- Focus state is visible.
- Chatbot no longer feels oversized or off-theme.

## Page Flow Requirements

Apply to these route groups:

- Home
- Heritage listing
- Heritage detail
- Explore map
- Historical map
- Passport
- Trip
- Auth
- Community chat
- Global chatbot

Required flow improvements:

- Make the primary action obvious.
- De-emphasize secondary actions.
- Add clear loading states.
- Add empty states with user guidance.
- Add error states with retry where possible.
- Keep mobile layouts free of horizontal scroll.
- Avoid overlapping fixed controls.
- Keep scroll and focus behavior predictable.

Use shared states where available:

- `src/components/common/MuseumStates.jsx`
- `src/components/common/LoadingScreen.jsx`
- `src/components/common/ui/EmptyState.jsx`

## Auth Flow Requirements

Files to inspect:

- `src/pages/Login.jsx`
- `src/pages/Register.jsx`
- `src/pages/ForgotPassword.jsx`
- `src/pages/EmailVerification.jsx`
- `src/components/NavBar/AuthButton.jsx`
- `src/components/NavBar/MobileMenu.jsx`

Requirements:

- Auth forms should feel like parchment/museum cards, not generic bright forms.
- Input icons and helper text must have enough contrast.
- Desktop and mobile auth CTAs should be consistent.
- Errors must be readable and not use dark red on dark surfaces.
- Form focus states must be visible.

## Map Flow Requirements

Files to inspect:

- `src/pages/GoogleMapHeritage/MapExplorer.jsx`
- `src/pages/GoogleMapHeritage/MapExplorer.css`
- `src/pages/GoogleMapHeritage/RoutePlayback.jsx`
- `src/pages/GoogleMapHeritage/ExploreOnboarding.jsx`
- `src/pages/HistoricalMap/HistoricalMap.jsx`
- `src/pages/HistoricalMap/GraphExplorer.jsx`
- `src/pages/HistoricalMap/RelationFlow.jsx`

Requirements:

- Fixed controls must not overlap on mobile.
- Mobile map controls should use a clear toolbar or drawer pattern.
- Loading, offline fallback, and retry states must be visible.
- Historical map fallback data should show a notice instead of silently changing behavior.
- Graph and flow views should load only when needed.

## Passport And Trip Flow Requirements

Files to inspect:

- `src/pages/HeritagePassport/PassportCollection.jsx`
- `src/pages/HeritagePassport/CommunityFeed.jsx`
- `src/pages/HeritageDetail/HeritageCheckIn.jsx`
- `src/pages/Trip/MyTrips.jsx`
- `src/pages/Trip/JourneysFeed.jsx`
- `src/pages/Trip/TripRecorder.jsx`
- `src/pages/Trip/TripDetail.jsx`

Requirements:

- Clarify whether `/passport` is guest demo or account-owned.
- Check-in requires login, so the passport UI should explain that clearly.
- Add query error states where missing.
- Empty states should explain the next action.
- Trip cards and feeds should use lazy image loading for non-LCP images.

## Heritage Listing And Detail Requirements

Files to inspect:

- `src/pages/Heritages.jsx`
- `src/components/Heritage/HeritageCard.jsx`
- `src/pages/HeritageDetail`

Requirements:

- Listing filters/search should have clear hierarchy.
- Empty search results should guide the user.
- Detail hero image should be treated as LCP when above the fold.
- Small labels on image overlays must have enough contrast.
- Avoid dark seal text on dark hero overlays.

## Performance Requirements

Do not optimize by adding dependencies.

Recommended changes:

- Keep above-the-fold content loaded efficiently.
- Do not lazy-load the Home hero inside an already lazy route if it delays LCP.
- Lazy-load heavy map, graph, 3D, and onboarding code only when needed.
- Avoid loading the full chatbot 3D stack before user intent.
- Lazy-load route playback only when a route exists.
- Lazy-load graph views only when graph view is selected.
- Add `loading="lazy"` and `decoding="async"` to non-LCP images.
- Use eager/high-priority loading for true LCP hero images.
- Respect `prefers-reduced-motion` for JS/canvas/map animations.
- Avoid recreating expensive map markers unnecessarily.
- Do not over-group unrelated heavy libraries in Vite manual chunks.

High-impact files:

- `src/App.jsx`
- `src/components/GlobalChatbot/GlobalChatbot.jsx`
- `src/pages/HistoricalMap/HistoricalMap.jsx`
- `src/pages/HistoricalMap/GraphExplorer.jsx`
- `src/pages/HistoricalMap/RelationFlow.jsx`
- `src/pages/GoogleMapHeritage/MapExplorer.jsx`
- `src/pages/GoogleMapHeritage/RoutePlayback.jsx`
- `src/pages/GoogleMapHeritage/ExploreOnboarding.jsx`
- `vite.config.js`

## Implementation Order

### Phase 1: Foundation

- Fix common UI color token usage.
- Improve global contrast rules.
- Standardize focus-visible styles.
- Remove obvious off-theme hardcoded colors from shared components.

### Phase 2: Shell

- Update navbar contrast.
- Update footer tone and hierarchy.
- Update mobile menu readability.

### Phase 3: Chatbot

- Reduce chatbot launcher size.
- Retheme chatbot panel.
- Improve chatbot loading/error/source states.
- Hide chatbot on dense routes.
- Defer heavy chatbot code where practical.

### Phase 4: Main Flows

- Standardize loading, empty, and error states.
- Improve hierarchy on heritage list/detail, passport, trip, map, and chat pages.
- Fix mobile overlap issues.

### Phase 5: Performance

- Defer heavy chatbot/map/graph code.
- Optimize images.
- Respect reduced motion.
- Improve route chunking carefully.

## Do Not Do

- Do not introduce new dependencies.
- Do not replace the entire design system.
- Do not rewrite unrelated business logic.
- Do not make sweeping color changes without checking contrast.
- Do not use bright cyan AI styling.
- Do not make the UI look like a generic SaaS dashboard.
- Do not remove existing accessibility attributes.
- Do not hide errors silently.
- Do not break component props or route APIs unless explicitly approved.
- Do not modify unrelated user changes.

## Verification Checklist

Run after implementation:

```bash
npm run lint
npm run build
```

Manual QA:

- Header over hero image on desktop and mobile.
- Footer contrast and link focus.
- Chatbot closed, open, minimized, loading, error, source, and evidence states.
- Home page mobile layout.
- Heritage listing empty/loading/error states.
- Heritage detail hero image and CTAs.
- Explore map controls on mobile.
- Historical map graph/map toggle.
- Login/register focus order.
- Keyboard navigation through navbar, footer, chatbot, and modal controls.

## Final Acceptance Criteria

The UI/UX refresh is complete only when:

- The full site visually follows the historical/museum theme.
- Header text no longer sinks into background imagery.
- Footer feels darker, calmer, and more premium.
- AI/chatbot is smaller and theme-consistent.
- Text contrast meets WCAG AA for normal content.
- Mobile layouts avoid horizontal scroll and fixed-control overlap.
- Loading, empty, and error states are explicit.
- Heavy code is deferred where practical.
- `npm run lint` passes.
- `npm run build` passes.
