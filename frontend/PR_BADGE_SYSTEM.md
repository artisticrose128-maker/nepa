# Badge System Components

Closes #308

## Summary

Implements a complete badge component system with three new components: `Badge`, `NotificationBadge`, and `StatusBadge`. All components integrate with the existing Tailwind CSS / CSS-variable design system and are fully tested.

## Changes

### New Components
- `src/components/Badge.tsx` — inline label component with 8 variants, 3 sizes, icon support, and fade-in animation
- `src/components/NotificationBadge.tsx` — overlay wrapper that attaches a count or dot indicator to any child element, with scale-in and pulse animations
- `src/components/StatusBadge.tsx` — dot + label component for conveying entity lifecycle states (active, inactive, pending, error, warning)

### New Tests
- `src/components/Badge.test.tsx` — unit tests, jest-axe accessibility checks, and fast-check property tests
- `src/components/NotificationBadge.test.tsx` — unit tests, jest-axe accessibility checks, and fast-check property tests
- `src/components/StatusBadge.test.tsx` — unit tests and fast-check property tests

### Supporting Changes
- `src/index.css` — added `animate-badge-fade-in` (150ms), `animate-badge-scale-in` (150ms), and `animate-badge-pulse` (300ms) keyframes
- `src/setupTests.ts` — added `jest-axe/extend-expect` for global `toHaveNoViolations` matcher
- `jest.config.js` — updated ts-jest config to use modern transform syntax with JSX and esModuleInterop support
- `package.json` — added `@types/jest-axe` devDependency

## Test Results

```
Test Suites: 3 passed, 3 total
Tests:       63 passed, 63 total
```

## Accessibility

- `Badge` renders as a non-interactive `<span>` with optional `aria-label` and `aria-hidden` icon container
- `NotificationBadge` wrapper uses `role="status"` for live region announcements; indicator uses `role="status"` with descriptive `aria-label`
- `StatusBadge` dot is `aria-hidden="true"`; container exposes status via `aria-label="Status: {status}"`
- All animations respect `prefers-reduced-motion` via the existing rule in `theme.css`
