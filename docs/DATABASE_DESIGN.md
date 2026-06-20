# NutriAI — Database Design

**Version:** 1.0  
**Storage:** IndexedDB via Dexie.js  
**Last Updated:** June 19, 2026

---

## 1. Design Principles

1. **Repository boundary** — Only `src/repositories/indexeddb/` and `src/infrastructure/database/` touch Dexie
2. **Cloud-ready schema** — Table/column names mirror future PostgreSQL tables
3. **Denormalization for read performance** — Meal stores computed totals; DailyLog is materialized
4. **ISO formats** — Dates as `YYYY-MM-DD`, datetimes as ISO 8601 strings
5. **Migrations** — Dexie versioning for schema evolution

---

## 2. Dexie Database Schema

### Database Name: `NutriAIDB`

```typescript
// src/infrastructure/database/nutriai-db.ts
import Dexie, { type Table } from 'dexie';

export class NutriAIDatabase extends Dexie {
  foods!: Table<FoodRecord, string>;
  meals!: Table<MealRecord, string>;
  mealTemplates!: Table<MealTemplateRecord, string>;
  dailyLogs!: Table<DailyLogRecord, string>;
  weightEntries!: Table<WeightEntryRecord, string>;
  userProfile!: Table<UserProfileRecord, string>;
  gamification!: Table<GamificationRecord, string>;
  settings!: Table<SettingsRecord, string>;
  recentFoods!: Table<RecentFoodRecord, string>;

  constructor() {
    super('NutriAIDB');

    this.version(1).stores({
      foods: 'id, name, brand, isFavorite, isCustom, *tags, createdAt',
      meals: 'id, date, mealType, createdAt, [date+mealType]',
      mealTemplates: 'id, name, mealType, createdAt',
      dailyLogs: 'id, &date, updatedAt',
      weightEntries: 'id, &date, createdAt',
      userProfile: 'id',
      gamification: 'id',
      settings: 'id',
      recentFoods: 'foodId, lastUsedAt',
    });
  }
}

export const db = new NutriAIDatabase();
```

### Index Legend

| Syntax | Meaning |
|--------|---------|
| `id` | Primary key |
| `&date` | Unique index on date |
| `*tags` | Multi-entry index (array) |
| `[date+mealType]` | Compound index |

---

## 3. Table Definitions

### 3.1 `foods`

| Column | Type | Indexed | Notes |
|--------|------|---------|-------|
| `id` | string (UUID) | PK | |
| `name` | string | Yes | Search primary field |
| `brand` | string? | Yes | |
| `servingSize` | number | | |
| `servingUnit` | string | | Enum |
| `calories` | number | | Per serving |
| `protein` | number | | grams |
| `carbs` | number | | grams |
| `fat` | number | | grams |
| `fiber` | number? | | grams |
| `sugar` | number? | | grams |
| `sodium` | number? | | mg |
| `isFavorite` | boolean | Yes | Filter index |
| `tags` | string[] | Multi | e.g. `indian`, `protein` |
| `isCustom` | boolean | Yes | User vs seed |
| `createdAt` | string | Yes | ISO datetime |
| `updatedAt` | string | | ISO datetime |

**Estimated rows:** 500+ (seed) + user custom foods

---

### 3.2 `meals`

| Column | Type | Indexed | Notes |
|--------|------|---------|-------|
| `id` | string (UUID) | PK | |
| `name` | string | | e.g. "Breakfast" |
| `mealType` | string | Yes | Enum |
| `date` | string | Yes | YYYY-MM-DD |
| `foods` | MealFoodItem[] | | Embedded JSON array |
| `totalCalories` | number | | Denormalized |
| `totalProtein` | number | | |
| `totalCarbs` | number | | |
| `totalFat` | number | | |
| `notes` | string? | | |
| `createdAt` | string | Yes | |
| `updatedAt` | string | | |

**Query patterns:**
- `meals.where('date').equals(today)` — dashboard
- `meals.where('date').between(start, end)` — analytics
- `meals.orderBy('createdAt').reverse().limit(20)` — recent

---

### 3.3 `mealTemplates`

| Column | Type | Indexed | Notes |
|--------|------|---------|-------|
| `id` | string (UUID) | PK | |
| `name` | string | Yes | |
| `mealType` | string | Yes | |
| `foods` | TemplateFoodItem[] | | `{ foodId, servings }[]` |
| `createdAt` | string | Yes | |
| `updatedAt` | string | | |

---

### 3.4 `dailyLogs`

| Column | Type | Indexed | Notes |
|--------|------|---------|-------|
| `id` | string (UUID) | PK | |
| `date` | string | Unique | YYYY-MM-DD |
| `caloriesConsumed` | number | | |
| `proteinConsumed` | number | | |
| `carbsConsumed` | number | | |
| `fatConsumed` | number | | |
| `waterConsumed` | number | | ml |
| `steps` | number? | | Future wearable |
| `notes` | string? | | |
| `mealCount` | number | | |
| `updatedAt` | string | Yes | |

**Query patterns:**
- `dailyLogs.where('date').equals(today)` — dashboard
- `dailyLogs.where('date').between(weekStart, weekEnd)` — weekly report
- `dailyLogs.orderBy('date').reverse().limit(30)` — streak calc

---

### 3.5 `weightEntries`

| Column | Type | Indexed | Notes |
|--------|------|---------|-------|
| `id` | string (UUID) | PK | |
| `date` | string | Unique | YYYY-MM-DD |
| `weight` | number | | kg |
| `bodyFatPercentage` | number? | | |
| `notes` | string? | | |
| `createdAt` | string | Yes | |

---

### 3.6 `userProfile`

| Column | Type | Indexed | Notes |
|--------|------|---------|-------|
| `id` | string (UUID) | PK | Single row in v1 |
| `name` | string | | |
| `gender` | string | | Enum |
| `age` | number | | |
| `height` | number | | cm |
| `weight` | number | | kg |
| `targetWeight` | number | | kg |
| `activityLevel` | string | | Enum |
| `goalType` | string | | Enum |
| `dailyCalories` | number | | |
| `dailyProtein` | number | | |
| `dailyCarbs` | number | | |
| `dailyFat` | number | | |
| `dailyWater` | number | | ml |
| `calorieAdjustment` | number | | |
| `useCustomTargets` | boolean | | |
| `createdAt` | string | | |
| `updatedAt` | string | | |

**v1 constraint:** Only one profile row (`id = 'default'`)

---

### 3.7 `gamification`

| Column | Type | Indexed | Notes |
|--------|------|---------|-------|
| `id` | string (UUID) | PK | Single row in v1 |
| `totalXP` | number | | |
| `level` | number | | |
| `currentStreak` | number | | |
| `longestStreak` | number | | |
| `lastLoggedDate` | string? | | |
| `unlockedAchievements` | string[] | | Achievement IDs |
| `stats` | object | | GamificationStats JSON |
| `updatedAt` | string | | |

---

### 3.8 `settings`

| Column | Type | Indexed | Notes |
|--------|------|---------|-------|
| `id` | string (UUID) | PK | Single row in v1 |
| `theme` | string | | light/dark/system |
| `waterQuickAdds` | number[] | | |
| `defaultMealType` | string | | |
| `reminders` | Reminder[] | | JSON array |
| `hasCompletedOnboarding` | boolean | | |
| `hasSeededData` | boolean | | |
| `locale` | string | | |
| `updatedAt` | string | | |

---

### 3.9 `recentFoods`

| Column | Type | Indexed | Notes |
|--------|------|---------|-------|
| `foodId` | string | PK | |
| `lastUsedAt` | string | Yes | ISO datetime |
| `useCount` | number | | |

Updated on each meal log. Top 20 by `lastUsedAt` for search recents.

---

## 4. Embedded Types (JSON)

### MealFoodItem (in `meals.foods`)

```json
{
  "foodId": "uuid",
  "foodName": "Chicken Breast",
  "servings": 1.5,
  "macros": {
    "calories": 248,
    "protein": 46.5,
    "carbs": 0,
    "fat": 5.4
  }
}
```

### TemplateFoodItem (in `mealTemplates.foods`)

```json
{
  "foodId": "uuid",
  "servings": 1
}
```

### GamificationStats (in `gamification.stats`)

```json
{
  "totalMealsLogged": 42,
  "totalCaloriesLogged": 84000,
  "totalWeightEntries": 15,
  "proteinGoalHitCount": 8,
  "waterGoalHitCount": 5,
  "daysLogged": 30
}
```

---

## 5. Entity-Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ userProfile  │       │   settings   │       │ gamification │
│   (1 row)    │       │   (1 row)    │       │   (1 row)    │
└──────────────┘       └──────────────┘       └──────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    foods     │◀──────│ recentFoods  │       │mealTemplates │
│   (500+)     │       │   (≤50)      │       │    (N)       │
└──────┬───────┘       └──────────────┘       └──────────────┘
       │
       │ referenced by
       ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    meals     │──────▶│  dailyLogs   │       │weightEntries │
│  (N/date)    │aggregates     (1/date)       │  (1/date)    │
└──────────────┘       └──────────────┘       └──────────────┘
```

---

## 6. Data Access Patterns

| Feature | Tables | Query |
|---------|--------|-------|
| Dashboard | dailyLogs, meals, userProfile, gamification, weightEntries | Today's log + profile targets |
| Food search | foods, recentFoods | Full scan + Fuse.js (cached) |
| Log meal | meals, foods, dailyLogs, recentFoods, gamification | Write meal → recompute daily log |
| Analytics | dailyLogs, weightEntries | Date range scan |
| Streak | dailyLogs or gamification | Last N days with mealCount > 0 |
| Templates | mealTemplates, foods | Template + food lookup |
| Export | All tables | Full table scan |
| Import | All tables | Bulk put in transaction |

---

## 7. Transactions

Critical multi-table operations use Dexie transactions:

```typescript
await db.transaction('rw', [db.meals, db.dailyLogs, db.recentFoods, db.gamification], async () => {
  await db.meals.put(meal);
  await db.dailyLogs.put(updatedDailyLog);
  await db.recentFoods.put(recentFood);
  await db.gamification.put(updatedGamification);
});
```

---

## 8. Migrations Strategy

```typescript
// Version 2 example (future)
this.version(2).stores({
  foods: 'id, name, brand, isFavorite, isCustom, *tags, createdAt, barcode', // add barcode
}).upgrade(async (tx) => {
  await tx.table('foods').toCollection().modify((food) => {
    food.barcode = null;
  });
});
```

### Migration Rules

1. Never delete columns without version bump
2. Always provide `.upgrade()` for data backfill
3. Test migrations with `fake-indexeddb` in CI
4. Export schema version in backup JSON

---

## 9. Seed Data Strategy

```
public/data/seed-foods.json     (~500 foods, ~200KB gzipped)
public/data/seed-templates.json (~20 meal templates)
```

**First-run flow:**
1. Check `settings.hasSeededData`
2. If false, `bulkInsert` foods in batches of 100
3. Insert meal templates
4. Set `hasSeededData = true`

Seed foods tagged: `indian`, `international`, `protein`, `carb`, `vegetable`, `fruit`, `dairy`, `snack`

---

## 10. Storage Estimates

| Table | Est. Size |
|-------|-----------|
| foods (500) | ~150 KB |
| meals (1 year, 4/day) | ~500 KB |
| dailyLogs (365) | ~50 KB |
| weightEntries (365) | ~30 KB |
| Other | ~10 KB |
| **Total (1 year)** | **~750 KB** |

Well within IndexedDB limits (typically 50%+ of disk).

---

## 11. Future PostgreSQL Schema (Reference)

For cloud migration, tables map 1:1 with added `user_id` and timestamps:

```sql
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  brand TEXT,
  serving_size DECIMAL NOT NULL,
  serving_unit TEXT NOT NULL,
  calories DECIMAL NOT NULL,
  protein DECIMAL NOT NULL,
  carbs DECIMAL NOT NULL,
  fat DECIMAL NOT NULL,
  fiber DECIMAL,
  sugar DECIMAL,
  sodium DECIMAL,
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  is_custom BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_foods_user_name ON foods(user_id, name);
CREATE INDEX idx_foods_tags ON foods USING GIN(tags);

-- Similar for meals, daily_logs, weight_entries, etc.
```

Repository implementations swap Dexie calls for SQL/Supabase client calls. Domain entities unchanged.

---

## 12. Backup Format Mapping

| Backup Field | Source Table |
|--------------|--------------|
| `profile` | `userProfile` (single row) |
| `foods` | `foods` (all) |
| `meals` | `meals` (all) |
| `mealTemplates` | `mealTemplates` (all) |
| `dailyLogs` | `dailyLogs` (all) |
| `weightEntries` | `weightEntries` (all) |
| `gamification` | `gamification` (single row) |
| `settings` | `settings` (single row) |

Import uses `db.transaction('rw', allTables)` for atomic restore.
