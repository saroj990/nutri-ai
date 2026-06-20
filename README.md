# NutriAI

Offline-first calorie and nutrition tracking app that runs entirely in your browser. No backend, no cloud sync — your data stays on your device.

Track meals, macros, water, and weight against a personalized diet plan built from your height, weight, and goals (bulk, stay fit, or lose weight).

## Highlights

- **100% local** — IndexedDB storage, works offline after first visit
- **Personalized diet plan** — calorie and macro targets from Mifflin-St Jeor (BMR/TDEE)
- **629+ seed foods** — searchable library with favorites, tags, and custom foods
- **Meal logging** — daily tracking with templates, duplicate, and dashboard rings
- **Water & weight** — quick-add hydration, weight trends, and history
- **Analytics & reports** — daily / weekly / monthly summaries
- **Gamification** — XP, levels, 8 achievements, streaks
- **Local login** — email + password locks access on this device (PBKDF2 hashed)
- **PWA-ready** — installable via manifest, dark/light mode
- **Responsive** — mobile bottom nav + laptop side nav

## User flow

1. **Create account** at `/login` (one account per device)
2. **Onboarding** — name, height, weight, activity, goal (Cut / Lean / Bulk)
3. **Review your plan** — daily calories, macros, and meal breakdown
4. **Log against the plan** — meals, water, weight on the dashboard and `/plan`
5. **Track progress** — analytics, reports, achievements

## Routes

| Route | Description |
|-------|-------------|
| `/login` | Local login and account creation |
| `/onboarding` | Profile setup wizard (first-time after register) |
| `/` | Dashboard — calories, macros, streak, XP, water |
| `/plan` | Personalized diet chart and meal targets |
| `/log` | Today's meals and templates |
| `/log/new` | Log a new meal |
| `/foods` | Food library (search, filter, CRUD) |
| `/water` | Water tracker with quick-add (+250, +500, +1000 ml) |
| `/weight` | Weight log, chart, and history |
| `/analytics` | Nutrition charts (week / month / quarter) |
| `/reports` | Daily, weekly, monthly summary cards |
| `/achievements` | XP bar, levels, locked/unlocked badges |
| `/goals` | Calorie and macro targets (auto or custom) |
| `/profile` | Edit body stats and goal type |
| `/settings` | Account links, log out |
| `/sys/reset` | Secret page to wipe all local data |

## Local login

NutriAI uses **device-local authentication** — not a cloud account.

- Register with email + password (min 8 characters)
- Passwords are hashed with **PBKDF2** (100k iterations, Web Crypto API)
- Session stored in `localStorage` on this browser
- **Log out** from Settings → Local account

Unauthenticated users are redirected to `/login`. Public routes: `/login`, `/sys/reset`.

## Secret data reset

For development or a full factory reset. Clears **all** IndexedDB data (meals, profile, foods, auth, settings).

### UI

Visit `/sys/reset` and enter the secret key, or use a query param:

```
http://localhost:3000/sys/reset?key=YOUR_SECRET
```

### API

```bash
curl -X POST http://localhost:3000/api/sys/clear-data \
  -H "Content-Type: application/json" \
  -d '{"key":"YOUR_SECRET"}'
```

Or header: `X-Reset-Key: YOUR_SECRET`

### Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `DATA_RESET_SECRET` | Key for reset API and `/sys/reset` (default in dev: `nutriai-dev-reset`) |

After a reset you are redirected to `/login`. Food seed data reloads on next app init.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production:

```bash
npm run build
npm run start
```

Regenerate seed food JSON (629 foods):

```bash
npm run generate:seed
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run test` | Run Vitest test suite |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:coverage` | Coverage report |
| `npm run lint` | ESLint |
| `npm run generate:seed` | Regenerate `public/data/seed-foods.json` |

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| UI | Tailwind CSS 4, shadcn-style components |
| State | Zustand |
| Database | Dexie.js (IndexedDB) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Search | Fuse.js |
| Lists | TanStack Virtual |
| Toasts | Sonner |
| Testing | Vitest, React Testing Library, fake-indexeddb |

## Architecture

Repository pattern — domain defines ports; `src/repositories/indexeddb/` implements them. Business logic never touches IndexedDB directly.

```
src/
  domain/              # Entities, value objects, repository ports, Zod schemas
  repositories/        # IndexedDB implementations
  services/            # Meal logging, gamification, analytics, diet plan, auth, etc.
  stores/              # Zustand (profile, meals, dashboard, auth, …)
  features/            # UI by feature (foods, meals, water, plan, auth, …)
  components/
    ui/                # Button, Card, Tabs, …
    shared/            # AppShell, SideNav, BottomNav, CalorieRing, …
  infrastructure/
    database/          # Dexie schema (NutriAIDB)
    di/                # Repository container + React context
    crypto/            # Password hashing
  app/                 # Next.js routes
  lib/                 # Constants, utils, auth session
```

### IndexedDB tables

`foods`, `meals`, `mealTemplates`, `dailyLogs`, `weightEntries`, `userProfile`, `gamification`, `settings`, `recentFoods`, `localAuth`

### Key services

| Service | Purpose |
|---------|---------|
| `GoalCalculationService` | BMR, TDEE, macro targets by goal type |
| `DietPlanService` | Meal breakdown (breakfast/lunch/dinner/snack) |
| `MealLoggingService` | Log/delete meals, recompute daily logs |
| `GamificationService` | XP, streaks, achievement checks |
| `AnalyticsService` | Week/month/quarter nutrition aggregation |
| `ReportService` | Daily/weekly/monthly summaries |
| `WaterService` | Hydration tracking |
| `WeightAnalyticsService` | Weight stats and trends |
| `LocalAuthService` | Register, login, logout |
| `SeedDataService` | First-run food database seed |

## Goals & diet plan

On onboarding you choose:

| Goal | Label | Macro emphasis |
|------|-------|----------------|
| `weight_loss` | Cut / Lose weight | Higher protein (35%) |
| `maintenance` | Lean / Stay fit | Balanced 30/40/30 |
| `weight_gain` | Bulk / Bulk up | Higher carbs (45%) |

Daily targets are calculated from height, weight, age, gender, activity level, and calorie deficit/surplus. View and log against the plan at `/plan`.

## Gamification

- **XP** for logging meals, water, weight, hitting goals, streaks
- **Levels** — `floor(sqrt(totalXP / 100))`
- **8 achievements** — First Bite, Week Warrior, Monthly Master, Protein Pro, Century Club, Hydration Hero, Scale Champion, Rising Star

## Phase status

- [x] **Phase 1** — Foundation, Dexie schema, repository pattern, app shell
- [x] **Phase 2** — Profile, goals, onboarding wizard
- [x] **Phase 3** — Food library (629 foods), search, CRUD, laptop layout
- [x] **Phase 4** — Meal logging, dashboard, gamification hooks
- [x] **Phase 5** — Water, weight, analytics charts
- [x] **Phase 6** — Achievements, reports, XP bar
- [x] **Extras** — Personalized diet plan (`/plan`), local login, secret reset
- [ ] **Phase 7** — Import/export, reminders, theme settings
- [ ] **Phase 8** — PWA polish, testing, launch prep

## Testing

```bash
npm run test
```

54+ unit/integration tests covering services, repositories, auth, and clear-data. Domain-focused tests use `fake-indexeddb`.

## Documentation

Planning and design docs in `docs/`:

- `PRD.md` — Product requirements
- `ARCHITECTURE.md` — System design
- `DOMAIN_MODEL.md` — Entities and relationships
- `DATABASE_DESIGN.md` — IndexedDB schema
- `ROADMAP.md` — Phased delivery plan

## Privacy

All nutrition data, profile, and credentials are stored **only in your browser** (IndexedDB + localStorage session). Nothing is sent to a remote server in v1. Export/import is planned for Phase 7.

## License

Private project — see repository owner for terms.
