# NutriAI — Technical Architecture

**Version:** 1.0  
**Last Updated:** June 19, 2026

---

## 1. Architecture Overview

NutriAI follows **Clean Architecture** with a strict **Repository Pattern** separating domain logic from infrastructure. The UI layer never touches IndexedDB directly.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                        │
│  Next.js App Router │ Pages │ Components │ Zustand Stores       │
└────────────────────────────┬────────────────────────────────────┘
                             │ hooks / actions
┌────────────────────────────▼────────────────────────────────────┐
│                      Application Layer                           │
│  Services │ Use Cases │ DTOs │ Zod Schemas                    │
└────────────────────────────┬────────────────────────────────────┘
                             │ repository interfaces
┌────────────────────────────▼────────────────────────────────────┐
│                        Domain Layer                              │
│  Entities │ Value Objects │ Domain Events │ Business Rules       │
└────────────────────────────┬────────────────────────────────────┘
                             │ implements
┌────────────────────────────▼────────────────────────────────────┐
│                     Infrastructure Layer                         │
│  IndexedDB (Dexie) │ PWA (SW) │ Local Notifications │ Seed Data │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency Rule

Dependencies point **inward only**. Domain has zero framework imports. Infrastructure implements domain interfaces.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 15 (App Router) | Routing, SSR shell, PWA host |
| Language | TypeScript (strict) | Type safety |
| UI | React 19, Tailwind CSS, shadcn/ui | Components & styling |
| State | Zustand | Client state, optimistic UI |
| Persistence | Dexie.js (IndexedDB) | Offline storage |
| Validation | Zod | Runtime schema validation |
| Forms | React Hook Form | Form state & validation |
| Charts | Recharts | Analytics visualization |
| Dates | Day.js | Timezone-safe date math |
| Search | Fuse.js | Fuzzy offline search |
| Testing | Vitest, React Testing Library | Unit & component tests |
| PWA | next-pwa / Serwist | Service worker, caching |

---

## 3. Layer Responsibilities

### 3.1 Presentation Layer (`src/app`, `src/features`, `src/components`)

- Renders UI, handles user input
- Consumes Zustand stores and custom hooks
- No direct repository imports in components (only via hooks/services)
- Server Components for static shell; Client Components for interactive features

### 3.2 Application Layer (`src/services`, `src/hooks`)

- Orchestrates use cases: `LogMealUseCase`, `CalculateGoalsUseCase`
- Maps domain entities ↔ view models
- Triggers side effects (XP, achievements, daily log aggregation)
- Validates input with Zod before passing to repositories

### 3.3 Domain Layer (`src/domain`)

- Pure TypeScript entities and value objects
- Business rules: calorie calculations, streak logic, XP formulas
- Repository **interfaces** (ports)
- Domain events: `MealLogged`, `GoalAchieved`, `AchievementUnlocked`

### 3.4 Infrastructure Layer (`src/infrastructure`, `src/repositories`)

- `IndexedDBFoodRepository`, `IndexedDBMealRepository`, etc.
- Dexie schema & migrations
- Seed data loader
- PWA service worker registration
- Future: `SupabaseFoodRepository`, `PostgresMealRepository`

---

## 4. Repository Pattern

### 4.1 Interface Definitions (Domain Ports)

```typescript
// src/domain/repositories/food.repository.ts
export interface FoodRepository {
  getAll(): Promise<Food[]>;
  getById(id: string): Promise<Food | null>;
  search(query: FoodSearchQuery): Promise<Food[]>;
  getFavorites(): Promise<Food[]>;
  getRecent(limit: number): Promise<Food[]>;
  save(food: Food): Promise<void>;
  delete(id: string): Promise<void>;
  bulkInsert(foods: Food[]): Promise<void>;
}

export interface MealRepository {
  getByDate(date: string): Promise<Meal[]>;
  getById(id: string): Promise<Meal | null>;
  getTemplates(): Promise<MealTemplate[]>;
  save(meal: Meal): Promise<void>;
  saveTemplate(template: MealTemplate): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface DailyLogRepository {
  getByDate(date: string): Promise<DailyLog | null>;
  getByDateRange(from: string, to: string): Promise<DailyLog[]>;
  save(log: DailyLog): Promise<void>;
  upsertPartial(date: string, partial: Partial<DailyLog>): Promise<DailyLog>;
}

export interface WeightRepository {
  getAll(): Promise<WeightEntry[]>;
  getByDateRange(from: string, to: string): Promise<WeightEntry[]>;
  getLatest(): Promise<WeightEntry | null>;
  save(entry: WeightEntry): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface UserProfileRepository {
  get(): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
}

export interface GamificationRepository {
  getState(): Promise<GamificationState>;
  save(state: GamificationState): Promise<void>;
  getAchievements(): Promise<Achievement[]>;
  unlockAchievement(id: string): Promise<void>;
}

export interface SettingsRepository {
  get(): Promise<AppSettings>;
  save(settings: AppSettings): Promise<void>;
}
```

### 4.2 Dependency Injection

```typescript
// src/infrastructure/di/container.ts
export interface RepositoryContainer {
  food: FoodRepository;
  meal: MealRepository;
  dailyLog: DailyLogRepository;
  weight: WeightRepository;
  userProfile: UserProfileRepository;
  gamification: GamificationRepository;
  settings: SettingsRepository;
}

export function createIndexedDBContainer(): RepositoryContainer {
  return {
    food: new IndexedDBFoodRepository(),
    meal: new IndexedDBMealRepository(),
    dailyLog: new IndexedDBDailyLogRepository(),
    weight: new IndexedDBWeightRepository(),
    userProfile: new IndexedDBUserProfileRepository(),
    gamification: new IndexedDBGamificationRepository(),
    settings: new IndexedDBSettingsRepository(),
  };
}

// Future:
// export function createSupabaseContainer(client: SupabaseClient): RepositoryContainer
```

React context provides the container to hooks:

```typescript
// src/infrastructure/di/repository-context.tsx
const RepositoryContext = createContext<RepositoryContainer | null>(null);
export const useRepositories = () => useContext(RepositoryContext)!;
```

---

## 5. State Management Strategy

### 5.1 Zustand Stores (by feature)

| Store | Responsibility |
|-------|----------------|
| `useProfileStore` | User profile, goals |
| `useDashboardStore` | Today's summary (derived + cached) |
| `useFoodStore` | Food list cache, search results |
| `useMealStore` | Today's meals, templates |
| `useWaterStore` | Today's water intake |
| `useWeightStore` | Weight entries |
| `useGamificationStore` | XP, level, achievements |
| `useSettingsStore` | Theme, reminders, preferences |
| `useUIStore` | Modals, toasts, loading states |

### 5.2 Data Flow

```
User Action → Component → Hook/Service → Repository → IndexedDB
                ↓                              ↓
           Zustand Store ←── Domain Service ←──┘
                ↓
           UI Re-render
```

- **Write path:** optimistic update → persist → rollback on error
- **Read path:** store cache with stale-while-revalidate from repository
- **Derived state:** computed in selectors (calories remaining, streak)

---

## 6. Service Layer (Use Cases)

| Service | Responsibility |
|---------|----------------|
| `GoalCalculationService` | TDEE, macro targets from profile |
| `MealLoggingService` | Create meal, aggregate macros, update daily log |
| `DailySummaryService` | Build dashboard snapshot for a date |
| `StreakService` | Calculate current/longest streak |
| `GamificationService` | Award XP, check achievements |
| `SearchService` | Fuse.js index over food cache |
| `AnalyticsService` | Aggregate daily logs for charts |
| `WeightAnalyticsService` | Weekly/monthly averages, trends |
| `ImportExportService` | JSON backup/restore |
| `ReminderService` | Schedule local notifications |
| `ReportService` | Generate daily/weekly/monthly reports |
| `SeedDataService` | First-run seed loading |

---

## 7. PWA Architecture

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Browser    │────▶│  Service Worker │────▶│  Cache API   │
│   (Client)   │     │  (Serwist)      │     │  (static)    │
└──────┬───────┘     └─────────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│  IndexedDB   │  ← All user data
│  (Dexie)     │
└──────────────┘
```

### Caching Strategy

| Asset Type | Strategy |
|------------|----------|
| App shell (HTML, JS, CSS) | Cache-first, network fallback |
| Static images/icons | Cache-first |
| API calls | N/A (no backend in v1) |
| Seed JSON | Cache on first load |

### Background Sync (Ready, Not Active v1)

Service worker registers sync tags (`sync-meals`, `sync-weight`) for future cloud push. v1 no-ops.

### Web App Manifest

```json
{
  "name": "NutriAI",
  "short_name": "NutriAI",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#10b981",
  "icons": [/* 192, 512 */]
}
```

---

## 8. Notification Architecture

```
┌─────────────────┐
│ ReminderService │
└────────┬────────┘
         │
    ┌────▼─────┐         ┌──────────────────┐
    │ v1: Local │         │ v2: Push (FCM)   │
    │ setTimeout│         │ Service Worker   │
    │ + Notif.  │         │ + Backend        │
    │   API     │         └──────────────────┘
    └──────────┘
```

**v1:** `ReminderService` schedules via `setInterval` / `setTimeout` when app is open; uses Notification API if permission granted.

**Interface:**

```typescript
export interface NotificationProvider {
  requestPermission(): Promise<NotificationPermission>;
  schedule(reminder: Reminder): Promise<string>; // returns schedule id
  cancel(scheduleId: string): Promise<void>;
}
```

---

## 9. Search Architecture

```
FoodRepository.getAll() → SearchService.buildIndex() → Fuse.js instance
                                                              ↓
User types query ──────────────────────────────────▶ search(query) → Food[]
```

- Index rebuilt on food CRUD
- Recent foods tracked in `DailyLog` / separate `recentFoods` index
- Filters applied post-search (favorites, tags)

---

## 10. Import / Export Architecture

### Export Schema (`nutriai-backup-v1.json`)

```typescript
interface NutriAIBackup {
  version: '1.0';
  exportedAt: string;
  profile: UserProfile | null;
  foods: Food[];
  meals: Meal[];
  mealTemplates: MealTemplate[];
  dailyLogs: DailyLog[];
  weightEntries: WeightEntry[];
  gamification: GamificationState;
  settings: AppSettings;
}
```

### Import Flow

1. Validate with Zod `NutriAIBackupSchema`
2. Confirm with user (destructive replace)
3. Transactional write across all repositories
4. Rebuild search index
5. Refresh all Zustand stores

---

## 11. Testing Architecture

```
┌─────────────────────────────────────────┐
│              E2E (future: Playwright)    │
├─────────────────────────────────────────┤
│  Component Tests (RTL)                   │
│  features/dashboard, features/meals      │
├─────────────────────────────────────────┤
│  Service Tests (Vitest)                  │
│  GoalCalculation, Streak, Gamification   │
├─────────────────────────────────────────┤
│  Repository Tests (Vitest + fake-indexeddb)│
│  IndexedDB implementations               │
├─────────────────────────────────────────┤
│  Domain Tests (Vitest, pure)             │
│  Entities, value objects, calculations   │
└─────────────────────────────────────────┘
```

### Test Doubles

```typescript
export class InMemoryFoodRepository implements FoodRepository {
  private foods = new Map<string, Food>();
  // ... in-memory impl for fast unit tests
}
```

---

## 12. Error Handling

| Layer | Strategy |
|-------|----------|
| Repository | Throw typed `RepositoryError` (NotFound, Conflict, StorageQuota) |
| Service | Catch, wrap in `AppError` with user-friendly message |
| UI | Toast notifications via shadcn Sonner |
| Global | Error boundary per route segment |

---

## 13. Security Considerations (v1)

- All data local; no network requests for core features
- Export file is plain JSON (user responsibility)
- Import validates schema strictly (prevent prototype pollution via Zod)
- CSP headers in Next.js config
- No eval, no dangerouslySetInnerHTML

---

## 14. Performance Optimizations

- Virtualized food list (react-virtual) for 500+ items
- Debounced search (150ms)
- Lazy load analytics charts
- Code-split per feature route
- Dexie compound indexes for date queries
- Memoized selectors in Zustand
- `useTransition` for non-urgent UI updates

---

## 15. Accessibility

- Semantic HTML (`<main>`, `<nav>`, `<section>`)
- ARIA labels on icon-only buttons
- Focus trap in modals
- Skip navigation link
- `prefers-reduced-motion` respected
- Color contrast ≥ 4.5:1 (both themes)
- Screen reader announcements for goal achievements

---

## 16. Folder Structure

```
NutriAI/
├── docs/                          # Planning & architecture docs
├── public/
│   ├── icons/                     # PWA icons
│   ├── manifest.json
│   └── sw.js                      # Generated service worker
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (app)/                 # Authenticated app shell
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           # Dashboard
│   │   │   ├── log/
│   │   │   ├── foods/
│   │   │   ├── meals/
│   │   │   ├── analytics/
│   │   │   ├── weight/
│   │   │   ├── water/
│   │   │   ├── goals/
│   │   │   ├── profile/
│   │   │   ├── achievements/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── onboarding/
│   │   ├── layout.tsx
│   │   └── providers.tsx
│   ├── domain/
│   │   ├── entities/              # Food, Meal, UserProfile, etc.
│   │   ├── value-objects/         # Macros, ServingSize, DateRange
│   │   ├── repositories/          # Interface definitions (ports)
│   │   ├── events/                # Domain events
│   │   └── errors/                # Domain errors
│   ├── repositories/
│   │   └── indexeddb/             # Dexie implementations
│   ├── infrastructure/
│   │   ├── database/              # Dexie schema, migrations
│   │   ├── di/                    # Dependency injection
│   │   ├── pwa/                   # SW registration
│   │   ├── notifications/         # Local notification provider
│   │   └── seed/                  # Seed data loader
│   ├── services/                  # Application use cases
│   ├── features/                  # Feature modules (UI + hooks)
│   │   ├── dashboard/
│   │   ├── foods/
│   │   ├── meals/
│   │   ├── analytics/
│   │   ├── weight/
│   │   ├── water/
│   │   ├── goals/
│   │   ├── profile/
│   │   ├── gamification/
│   │   ├── reports/
│   │   └── settings/
│   ├── components/
│   │   ├── ui/                    # shadcn components
│   │   └── shared/                # AppShell, BottomNav, etc.
│   ├── hooks/                     # Cross-feature hooks
│   ├── stores/                    # Zustand stores
│   ├── lib/                       # Utilities, cn(), constants
│   └── types/                     # Shared type exports
├── tests/
│   ├── unit/
│   ├── integration/
│   └── __mocks__/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## 17. Cloud Migration Strategy

### Phase 1 (v1 — Current)
- IndexedDB via Dexie
- JSON export for manual backup

### Phase 2 (v2 — Cloud Sync)
1. Add `SupabaseRepository` implementing same interfaces
2. Add `SyncService` with conflict resolution (last-write-wins → CRDT later)
3. `RepositoryContainer` becomes hybrid: read local, write local + queue
4. Background sync via service worker

### Phase 3 (v3 — Multi-device)
- User auth (Supabase Auth)
- Real-time subscriptions
- Replace `get()` with user-scoped queries

### Migration Path for Existing Users

```
Export JSON (v1) → Import to cloud (v2 onboarding) → Delete local-only flag
```

### Interface Stability Contract

Repository interfaces are the **migration boundary**. No method signature changes without version bump. New methods added as optional extensions.

```typescript
// Future adapter example
export class SupabaseFoodRepository implements FoodRepository {
  constructor(private client: SupabaseClient, private userId: string) {}
  async getAll(): Promise<Food[]> {
    const { data } = await this.client.from('foods').select('*').eq('user_id', this.userId);
    return data.map(mapRowToFood);
  }
}
```

Business logic in `services/` remains unchanged.
