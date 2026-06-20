# NutriAI — Product Requirements Document (v1.0)

**Product Name:** NutriAI  
**Version:** 1.0 (Offline-First)  
**Status:** Draft  
**Last Updated:** June 19, 2026

---

## 1. Executive Summary

NutriAI is a personal nutrition and calorie tracking application that runs entirely in the browser with no backend dependency. Version 1 targets individuals pursuing weight loss, weight gain, maintenance, fitness, and general health goals. The product prioritizes speed, offline reliability, and a modern mobile-first experience comparable to MyFitnessPal and Cronometer, with design polish inspired by Linear and Notion.

The architecture is deliberately cloud-migration-ready: all persistence flows through a repository abstraction so IndexedDB can be swapped for PostgreSQL, Supabase, Firebase, or MongoDB without rewriting business logic.

---

## 2. Problem Statement

Existing calorie trackers often require accounts, constant connectivity, and subscriptions. Users need a fast, private, installable app that works on planes, in gyms, and in low-connectivity regions — while still feeling premium and portfolio-worthy.

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description |
|------|-------------|
| Offline-first | Full functionality without network after initial load |
| Fast logging | Add a meal in under 10 seconds |
| Accurate tracking | Macros, water, weight, streaks |
| Future-ready | Repository pattern enables cloud sync in v2+ |
| Portfolio quality | Polished UI, dark mode, PWA installable |

### 3.2 Success Metrics (v1)

- Time to first meal log: < 2 minutes (including onboarding)
- Search latency: < 50ms for 500+ foods
- Lighthouse PWA score: ≥ 90
- Zero runtime errors on core flows (dashboard, log meal, add food)
- 80%+ unit test coverage on domain/services layer

---

## 4. Target Users

| Persona | Needs |
|---------|-------|
| Weight loss seeker | Calorie deficit, streak motivation, progress charts |
| Weight gainer / bodybuilder | High protein targets, meal templates, macro splits |
| Maintenance tracker | Stable calories, habit consistency |
| Fitness enthusiast | Pre/post workout meal types, water tracking |
| Health-conscious general user | Simple logging, Indian + international foods |

---

## 5. Scope

### 5.1 In Scope (v1)

- User profile & goal calculation (TDEE-based with manual override)
- Food library (500+ seeded items) with CRUD, favorites, search
- Meal logging with templates and duplication
- Daily macro & calorie tracking with visual progress
- Water intake with quick-add buttons
- Weight tracking with trend charts
- Nutrition analytics (daily / weekly / monthly)
- Gamification (XP, levels, achievements, badges)
- Import / export (JSON backup)
- Local reminder architecture (no push in v1)
- Reports (daily, weekly, monthly summaries)
- PWA (installable, offline cache)
- Dark / light mode
- Accessibility (WCAG 2.1 AA target)

### 5.2 Out of Scope (v1)

- User accounts & authentication
- Cloud sync
- AI meal recommendations
- Wearable integrations
- Barcode scanning
- Push notifications (architecture only)
- Multi-user / family profiles
- Social features

### 5.3 Future Versions (v2+)

- Cloud sync via Supabase / Firebase
- AI coaching
- Barcode scanner (camera API)
- Wearable data import
- Family profiles
- Nutrition coaching marketplace

---

## 6. User Stories

### 6.1 Onboarding & Profile

- **US-001:** As a new user, I can set my name, age, gender, height, weight, activity level, and goal so the app calculates my daily calorie and macro targets.
- **US-002:** As a user, I can manually override calculated calorie and macro targets.
- **US-003:** As a user, I can update my profile at any time and see recalculated goals.

### 6.2 Dashboard

- **US-010:** As a user, I see today's calories consumed vs remaining at a glance.
- **US-011:** As a user, I see protein, carbs, fat, and water progress rings/bars.
- **US-012:** As a user, I see my current streak and recent weight trend snippet.
- **US-013:** As a user, I see my XP level and recent achievements.

### 6.3 Food Management

- **US-020:** As a user, I can add custom foods with full nutrition data.
- **US-021:** As a user, I can edit, delete, and duplicate foods.
- **US-022:** As a user, I can favorite foods for quick access.
- **US-023:** As a user, I can search foods by name, tag, or favorite status instantly.

### 6.4 Meal Tracking

- **US-030:** As a user, I can log a meal by adding one or more foods with serving quantities.
- **US-031:** As a user, I can assign a meal type (Breakfast, Lunch, Dinner, Snack, Pre/Post Workout).
- **US-032:** As a user, I can save a meal as a template and reuse it with one tap.
- **US-033:** As a user, I can duplicate a past meal to today.

### 6.5 Daily Tracking

- **US-040:** As a user, I see goal vs consumed vs remaining for calories and macros.
- **US-041:** As a user, daily totals update immediately when I log or remove meals.

### 6.6 Water Tracking

- **US-050:** As a user, I can quick-add 250ml, 500ml, or 1L of water.
- **US-051:** As a user, I see water progress toward my daily goal.

### 6.7 Weight Tracking

- **US-060:** As a user, I can log daily weight (and optional body fat %).
- **US-061:** As a user, I see weekly and monthly averages and a trend chart.

### 6.8 Analytics

- **US-070:** As a user, I can view calorie and macro trends over day/week/month.
- **US-071:** As a user, I can view weight trends alongside nutrition data.

### 6.9 Gamification

- **US-080:** As a user, I earn XP for logging meals, hitting goals, and maintaining streaks.
- **US-081:** As a user, I unlock achievements (First Meal, 7-Day Streak, 30-Day Streak, etc.).
- **US-082:** As a user, I can view my badges and milestone progress.

### 6.10 Data Portability

- **US-090:** As a user, I can export all data as JSON.
- **US-091:** As a user, I can import a JSON backup to restore or migrate.

### 6.11 Reminders (v1 — Local Only)

- **US-100:** As a user, I can configure local reminders for water, meals, and weigh-ins.
- **US-101:** Reminders use browser Notification API when permitted (architecture supports future push).

---

## 7. Functional Requirements

### 7.1 Goal Calculation

- Support goal types: `weight_loss`, `weight_gain`, `maintenance`
- Use Mifflin-St Jeor BMR formula
- Activity multipliers: sedentary (1.2), light (1.375), moderate (1.55), active (1.725), very active (1.9)
- Weight loss: TDEE − 500 kcal (configurable deficit)
- Weight gain: TDEE + 300 kcal (configurable surplus)
- Default macro split: 30% protein, 40% carbs, 30% fat (configurable)

### 7.2 Search

- Client-side full-text search across food name, brand, tags
- Filter: favorites only, recent foods (last 30 logged)
- Debounce: 150ms; results render in < 50ms

### 7.3 Gamification Rules

| Action | XP |
|--------|-----|
| Log first meal of day | 10 |
| Hit calorie goal (±5%) | 25 |
| Hit protein goal | 15 |
| Log water (each quick-add) | 5 |
| Log weight | 10 |
| Daily streak maintained | 20 |
| Achievement unlocked | 50–200 |

**Levels:** `level = floor(sqrt(totalXP / 100))`

### 7.4 Achievements (v1 Set)

| ID | Title | Condition |
|----|-------|-----------|
| `first_meal` | First Bite | Log first meal |
| `streak_7` | Week Warrior | 7-day logging streak |
| `streak_30` | Monthly Master | 30-day streak |
| `weight_10kg` | Scale Champion | Track 10kg total change |
| `protein_10` | Protein Pro | Hit protein goal 10 times |
| `water_week` | Hydration Hero | Hit water goal 7 days |
| `meals_100` | Century Club | Log 100 meals |
| `level_5` | Rising Star | Reach level 5 |

### 7.5 Reports

- **Daily:** calories, macros, water, meals list, streak
- **Weekly:** avg calories/macros, weight change, goal hit rate
- **Monthly:** same as weekly with longer trend windows

---

## 8. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | First Contentful Paint < 1.5s on 4G |
| Offline | All CRUD works offline after first visit |
| Security | No data leaves device in v1; export is user-initiated |
| Accessibility | Keyboard nav, ARIA labels, 4.5:1 contrast |
| Browser support | Chrome 100+, Safari 16+, Firefox 100+, Edge 100+ |
| Type safety | Strict TypeScript, Zod validation at boundaries |
| Testing | Vitest + RTL; domain layer 80%+ coverage |
| i18n-ready | Strings externalized (English v1) |

---

## 9. Information Architecture

```
/                     → Dashboard
/log                  → Today's meals & quick log
/foods                → Food library
/foods/new            → Add food
/foods/[id]           → Edit food
/meals                → Meal history & templates
/meals/new            → Log meal
/analytics            → Charts & trends
/weight               → Weight log & chart
/water                → Water tracker
/goals                → Goal settings
/profile              → User profile
/achievements         → Gamification hub
/reports              → Daily/weekly/monthly reports
/settings             → Theme, reminders, import/export
/onboarding           → First-run setup
```

---

## 10. UX Principles

1. **Log-first:** Primary CTA always visible (floating action or bottom nav)
2. **Glanceable dashboard:** Rings/bars, not tables
3. **Progressive disclosure:** Advanced fields hidden until needed
4. **Consistent meal flow:** Search → select → adjust serving → add
5. **Celebrate wins:** Subtle animations on goal hit and achievement unlock
6. **Dark mode default:** Respect `prefers-color-scheme`, allow override

---

## 11. Assumptions & Constraints

- Single user per browser/device in v1 (one profile)
- All dates stored as ISO 8601 date strings (`YYYY-MM-DD`) in local timezone
- Serving sizes stored as numeric + unit enum
- No server = no multi-device sync in v1
- Seed data ships with app (bundled JSON, loaded on first run)

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| IndexedDB quota limits | Compress seed data; lazy-load foods |
| Browser storage cleared | Prominent export reminder; import on onboarding |
| Complex repository abstraction overhead | Thin interfaces; code-gen for future adapters |
| Large seed dataset slows search | Index by name; prefix trie or Fuse.js |
| PWA cache stale after deploy | Service worker versioning strategy |

---

## 13. Acceptance Criteria (v1 Release)

- [ ] User completes onboarding and sees calculated goals
- [ ] User logs a meal from seed data in < 10 seconds
- [ ] Dashboard reflects logged data in real time
- [ ] Food CRUD, search, favorites work offline
- [ ] Meal templates save and reuse correctly
- [ ] Water quick-add updates progress
- [ ] Weight chart shows 7+ entries
- [ ] Analytics charts render daily/weekly/monthly
- [ ] At least 8 achievements unlockable
- [ ] JSON export/import round-trips all data
- [ ] PWA installable on mobile and desktop
- [ ] Dark and light themes functional
- [ ] Core flows pass automated tests

---

## 14. Glossary

| Term | Definition |
|------|------------|
| TDEE | Total Daily Energy Expenditure |
| Macro | Macronutrient (protein, carbs, fat) |
| Template | Saved meal composition for reuse |
| Streak | Consecutive days with at least one meal logged |
| Repository | Data access abstraction over storage backend |
