# NutriAI — Implementation Roadmap

**Version:** 1.0  
**Last Updated:** June 19, 2026

---

## Overview

Implementation is divided into **8 phases** over an estimated **4–6 weeks** of focused development. Each phase delivers testable, demoable functionality. Phases are sequential with some parallelization possible in Phases 5–7.

```
Phase 1 ──▶ Phase 2 ──▶ Phase 3 ──▶ Phase 4
                                              │
Phase 8 ◀── Phase 7 ◀── Phase 6 ◀── Phase 5 ◀┘
```

---

## Phase 1: Foundation & Scaffolding
**Duration:** 2–3 days  
**Goal:** Runnable Next.js app with architecture skeleton

### Tasks

- [ ] Initialize Next.js 15 + TypeScript + Tailwind + shadcn/ui
- [ ] Configure strict `tsconfig.json`, ESLint, Prettier
- [ ] Set up folder structure per architecture doc
- [ ] Install dependencies: zustand, dexie, zod, react-hook-form, recharts, dayjs, fuse.js
- [ ] Configure Vitest + React Testing Library + fake-indexeddb
- [ ] Create domain entities and value objects
- [ ] Define repository interfaces (ports)
- [ ] Set up DI container and React context
- [ ] Implement Dexie database schema (v1)
- [ ] Create IndexedDB repository stubs
- [ ] App shell: layout, bottom nav, theme provider (dark/light)
- [ ] PWA manifest + basic service worker setup

### Deliverables

- Empty app with navigation between placeholder pages
- Domain types compile with zero errors
- Database opens in browser DevTools
- Theme toggle works
- `npm run test` passes with sample test

### Acceptance

- `npm run dev` serves app at localhost
- `npm run build` succeeds
- Repository interfaces importable from domain without Dexie dependency

---

## Phase 2: Profile, Goals & Onboarding
**Duration:** 2–3 days  
**Goal:** User can complete onboarding and see calculated targets

### Tasks

- [ ] Implement `GoalCalculationService` with unit tests
- [ ] Implement `IndexedDBUserProfileRepository` and `IndexedDBSettingsRepository`
- [ ] Create Zod schemas for profile and settings
- [ ] Build onboarding flow (multi-step form with React Hook Form)
- [ ] Create `useProfileStore` and `useSettingsStore`
- [ ] Profile page (view/edit)
- [ ] Goals page (view targets, toggle custom override)
- [ ] Redirect to onboarding if `!hasCompletedOnboarding`

### Deliverables

- 4-step onboarding: Welcome → Body Stats → Activity & Goal → Review
- Calculated calorie/macro targets displayed
- Profile persisted in IndexedDB

### Acceptance

- New user completes onboarding, reloads page, data persists
- Changing goal type recalculates targets
- Custom override disables auto-calculation
- 90%+ test coverage on `GoalCalculationService`

---

## Phase 3: Food Library & Search
**Duration:** 3–4 days  
**Goal:** 500+ foods searchable, CRUD functional

### Tasks

- [ ] Generate seed data JSON (500+ foods: Indian, international, common)
- [ ] Implement `SeedDataService` with first-run loader
- [ ] Implement `IndexedDBFoodRepository` (full CRUD + bulk insert)
- [ ] Implement `SearchService` with Fuse.js
- [ ] Implement `recentFoods` tracking table
- [ ] Create `useFoodStore`
- [ ] Food list page with virtualized scroll
- [ ] Food detail/edit page
- [ ] Add food form (React Hook Form + Zod)
- [ ] Favorite toggle, duplicate, delete with confirmation
- [ ] Search bar with instant results, favorite filter, tag chips

### Deliverables

- Food library with 500+ seeded items
- Sub-50ms search
- Full food CRUD offline

### Acceptance

- First visit seeds database automatically
- Search "chicken" returns relevant results < 50ms
- Custom food CRUD round-trips through IndexedDB
- Favorites filter works

---

## Phase 4: Meal Logging & Daily Tracking
**Duration:** 4–5 days  
**Goal:** Core logging loop complete

### Tasks

- [ ] Implement `IndexedDBMealRepository` and `IndexedDBDailyLogRepository`
- [ ] Implement `MealLoggingService` (create, update, delete meal → update daily log)
- [ ] Implement meal templates (save, list, instantiate)
- [ ] Create `useMealStore`, `useDashboardStore`
- [ ] Log meal flow: select type → add foods → adjust servings → save
- [ ] Today's log page with meal cards grouped by type
- [ ] Duplicate meal (same day or different day)
- [ ] Dashboard: calorie ring, macro progress bars
- [ ] Quick-log FAB (floating action button)
- [ ] Implement `StreakService` and integrate with meal logging
- [ ] Implement `GamificationService` (XP on meal log)

### Deliverables

- Full meal logging workflow
- Dashboard shows real-time consumed vs goal
- Meal templates save and reuse
- Streak counter updates

### Acceptance

- Log breakfast with 3 foods, dashboard updates immediately
- Delete meal, dashboard recalculates
- Save template, reuse with one click
- Streak increments on consecutive days

---

## Phase 5: Water, Weight & Analytics
**Duration:** 3–4 days  
**Goal:** Complete health tracking visuals

### Tasks

- [ ] Water tracking: quick-add buttons (+250, +500, +1L), progress bar
- [ ] Implement `IndexedDBWeightRepository`
- [ ] Weight log form and history list
- [ ] Weight trend chart (Recharts line chart)
- [ ] Weekly/monthly weight averages
- [ ] Implement `AnalyticsService`
- [ ] Analytics page: calorie/macro charts (daily, weekly, monthly tabs)
- [ ] Combined weight + nutrition chart view
- [ ] `useWaterStore`, `useWeightStore`

### Deliverables

- Water tracker with quick-add
- Weight chart with trend line
- Analytics with interactive period toggles

### Acceptance

- Water quick-add updates dashboard
- Weight chart renders with 7+ data points
- Analytics switches between day/week/month views
- Charts responsive on mobile

---

## Phase 6: Gamification & Reports
**Duration:** 2–3 days  
**Goal:** Engagement features and summaries

### Tasks

- [ ] Implement `IndexedDBGamificationRepository`
- [ ] Define all v1 achievements with conditions
- [ ] Achievement checker runs on relevant domain events
- [ ] XP bar and level display on dashboard
- [ ] Achievements page with locked/unlocked badges
- [ ] Unlock animation (confetti or subtle pulse)
- [ ] Implement `ReportService`
- [ ] Reports page: daily, weekly, monthly summary cards
- [ ] Goal completion rate calculation

### Deliverables

- 8+ unlockable achievements
- XP/level system functional
- Report summaries for all periods

### Acceptance

- First meal unlocks "First Bite" achievement
- 7 consecutive days unlocks "Week Warrior"
- Weekly report shows avg calories and weight change

---

## Phase 7: Import/Export, Reminders & Settings
**Duration:** 2–3 days  
**Goal:** Data portability and preferences

### Tasks

- [ ] Implement `ImportExportService` with Zod validation
- [ ] Export button → download JSON file
- [ ] Import flow with file picker, validation, confirmation
- [ ] Settings page: theme, water quick-add customization
- [ ] Reminder configuration UI
- [ ] Implement `ReminderService` + `LocalNotificationProvider`
- [ ] Notification permission request flow
- [ ] Background sync tag registration (no-op handler)

### Deliverables

- Full JSON backup/restore
- Configurable reminders
- Settings persistence

### Acceptance

- Export → clear DB → import restores all data
- Invalid JSON rejected with error message
- Reminder fires in-app notification when permitted

---

## Phase 8: PWA Polish, Testing & Launch Prep
**Duration:** 3–4 days  
**Goal:** Production-quality, portfolio-ready release

### Tasks

- [ ] Finalize service worker caching strategy
- [ ] PWA install prompt component
- [ ] App icons (192, 512, maskable)
- [ ] Splash screen and meta tags
- [ ] Accessibility audit: keyboard nav, ARIA, contrast
- [ ] Animation polish (page transitions, progress animations)
- [ ] Error boundaries and toast notifications
- [ ] Loading skeletons for all pages
- [ ] Empty states for all lists
- [ ] Comprehensive test suite:
  - Domain services (80%+ coverage)
  - Repository integration tests
  - Component tests for dashboard, meal log, food search
- [ ] Performance audit (Lighthouse)
- [ ] README with setup instructions and architecture overview
- [ ] Final UI review: mobile, tablet, desktop breakpoints

### Deliverables

- Installable PWA scoring 90+ Lighthouse
- Test suite passing in CI
- README documentation
- Portfolio-ready screenshots

### Acceptance

- App installable on iOS Safari and Chrome Android
- Works fully offline after first load
- All acceptance criteria from PRD met
- `npm run build && npm run test` green

---

## Phase Summary Table

| Phase | Name | Days | Key Output |
|-------|------|------|------------|
| 1 | Foundation | 2–3 | Project scaffold, domain, DB schema |
| 2 | Profile & Goals | 2–3 | Onboarding, goal calculation |
| 3 | Food Library | 3–4 | 500+ foods, search, CRUD |
| 4 | Meal Logging | 4–5 | Dashboard, meals, templates, streaks |
| 5 | Water & Analytics | 3–4 | Water, weight charts, analytics |
| 6 | Gamification | 2–3 | XP, achievements, reports |
| 7 | Import/Export | 2–3 | Backup, reminders, settings |
| 8 | Polish & Launch | 3–4 | PWA, tests, accessibility |
| **Total** | | **21–29 days** | **v1.0 Release** |

---

## Testing Strategy by Phase

| Phase | Test Focus |
|-------|------------|
| 1 | Sample domain test, DB opens |
| 2 | GoalCalculationService unit tests |
| 3 | FoodRepository integration, SearchService unit |
| 4 | MealLoggingService unit, daily log aggregation |
| 5 | AnalyticsService unit, chart component smoke |
| 6 | GamificationService unit, achievement conditions |
| 7 | ImportExport round-trip integration test |
| 8 | Full suite, coverage report, a11y audit |

---

## Risk Checkpoints

| After Phase | Checkpoint |
|-------------|------------|
| 2 | Profile data persists across reload |
| 3 | Search performance with 500+ items |
| 4 | Dashboard accuracy vs manual calculation |
| 5 | Chart rendering on mobile Safari |
| 7 | Import/export data integrity |
| 8 | Lighthouse PWA audit |

---

## Post-v1 Roadmap (Future)

| Version | Features |
|---------|----------|
| v1.1 | Barcode scanning (client-side), recipe builder |
| v2.0 | Supabase sync, user accounts |
| v2.1 | AI meal suggestions (local LLM or API) |
| v3.0 | Wearable integration, family profiles |
| v3.1 | Push notifications, nutrition coaching |

---

## Next Step

**Proceed to Phase 1 implementation** upon approval of planning documents.

Phase 1 will scaffold the Next.js project and establish the architectural foundation that all subsequent phases build upon.
