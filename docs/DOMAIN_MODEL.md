# NutriAI — Domain Model Design

**Version:** 1.0  
**Last Updated:** June 19, 2026

---

## 1. Domain Model Overview

The domain layer contains pure TypeScript types, value objects, and business rules with **no framework dependencies**. All entities use branded ID types for compile-time safety.

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│ UserProfile │────▶│  DailyLog   │◀────│    Meal      │
└─────────────┘     └─────────────┘     └──────┬───────┘
       │                    ▲                    │
       │                    │                    │
       ▼                    │                    ▼
┌─────────────┐     ┌───────┴───────┐     ┌─────────────┐
│ WeightEntry │     │  Aggregator   │     │    Food     │
└─────────────┘     │  (Service)    │     └─────────────┘
                    └───────────────┘
┌─────────────┐     ┌───────────────┐
│ Gamification│     │ MealTemplate  │
│   State     │     └───────────────┘
└─────────────┘
```

---

## 2. Branded Types & IDs

```typescript
// src/domain/value-objects/ids.ts
export type FoodId = string & { readonly __brand: 'FoodId' };
export type MealId = string & { readonly __brand: 'MealId' };
export type DailyLogId = string & { readonly __brand: 'DailyLogId' };
export type WeightEntryId = string & { readonly __brand: 'WeightEntryId' };
export type UserProfileId = string & { readonly __brand: 'UserProfileId' };
export type MealTemplateId = string & { readonly __brand: 'MealTemplateId' };
export type AchievementId = string & { readonly __brand: 'AchievementId' };

export const createFoodId = (): FoodId => crypto.randomUUID() as FoodId;
// ... similar factories for each entity
```

---

## 3. Value Objects

### 3.1 Macros

```typescript
export interface Macros {
  calories: number;
  protein: number;   // grams
  carbs: number;     // grams
  fat: number;       // grams
}

export const ZERO_MACROS: Macros = { calories: 0, protein: 0, carbs: 0, fat: 0 };

export function addMacros(a: Macros, b: Macros): Macros {
  return {
    calories: a.calories + b.calories,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
  };
}

export function scaleMacros(macros: Macros, multiplier: number): Macros {
  return {
    calories: Math.round(macros.calories * multiplier),
    protein: round1(macros.protein * multiplier),
    carbs: round1(macros.carbs * multiplier),
    fat: round1(macros.fat * multiplier),
  };
}
```

### 3.2 ServingSize

```typescript
export type ServingUnit =
  | 'g' | 'ml' | 'oz' | 'cup' | 'tbsp' | 'tsp'
  | 'piece' | 'slice' | 'serving' | 'scoop';

export interface ServingSize {
  amount: number;
  unit: ServingUnit;
}
```

### 3.3 NutritionInfo (extended macros)

```typescript
export interface NutritionInfo extends Macros {
  fiber?: number;
  sugar?: number;
  sodium?: number;  // mg
}
```

### 3.4 DateString

```typescript
/** ISO date in local timezone: YYYY-MM-DD */
export type DateString = string & { readonly __brand: 'DateString' };

export function toDateString(date: Date): DateString {
  return date.toISOString().split('T')[0] as DateString;
}
```

### 3.5 GoalTargets

```typescript
export interface GoalTargets {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  dailyWater: number;  // ml, default 2500
}
```

---

## 4. Entities

### 4.1 UserProfile

```typescript
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export type GoalType = 'weight_loss' | 'weight_gain' | 'maintenance';

export interface UserProfile {
  id: UserProfileId;
  name: string;
  gender: Gender;
  age: number;
  height: number;          // cm
  weight: number;          // kg
  targetWeight: number;    // kg
  activityLevel: ActivityLevel;
  goalType: GoalType;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  dailyWater: number;      // ml
  calorieAdjustment: number; // deficit/surplus offset
  useCustomTargets: boolean;
  createdAt: string;         // ISO datetime
  updatedAt: string;
}
```

**Business Rules:**
- `age` must be 13–120
- `height` 100–250 cm, `weight` 30–300 kg
- If `useCustomTargets` is false, macros derived from `GoalCalculationService`

---

### 4.2 Food

```typescript
export interface Food {
  id: FoodId;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: ServingUnit;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  isFavorite: boolean;
  tags: string[];
  isCustom: boolean;       // user-created vs seed
  createdAt: string;
  updatedAt: string;
}

/** Nutrition per single serving (servingSize × servingUnit) */
export function getFoodMacros(food: Food, servings: number = 1): Macros {
  return scaleMacros(
    { calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat },
    servings
  );
}
```

---

### 4.3 MealFoodItem (join entity)

```typescript
export interface MealFoodItem {
  foodId: FoodId;
  foodName: string;        // denormalized for display/history
  servings: number;
  macros: Macros;          // computed at log time
}
```

---

### 4.4 Meal

```typescript
export type MealType =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'pre_workout'
  | 'post_workout';

export interface Meal {
  id: MealId;
  name: string;
  mealType: MealType;
  date: DateString;
  foods: MealFoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function computeMealTotals(foods: MealFoodItem[]): Macros {
  return foods.reduce((acc, item) => addMacros(acc, item.macros), ZERO_MACROS);
}
```

---

### 4.5 MealTemplate

```typescript
export interface MealTemplate {
  id: MealTemplateId;
  name: string;
  mealType: MealType;
  foods: Array<{
    foodId: FoodId;
    servings: number;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

Templates store food references + servings. Macros computed at instantiation time from current food data.

---

### 4.6 DailyLog

```typescript
export interface DailyLog {
  id: DailyLogId;
  date: DateString;
  caloriesConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  waterConsumed: number;    // ml
  steps?: number;
  notes?: string;
  mealCount: number;
  updatedAt: string;
}
```

**Aggregation Rule:** `DailyLog` is a **materialized summary** updated whenever meals change for that date. Single source of truth for analytics queries.

---

### 4.7 WeightEntry

```typescript
export interface WeightEntry {
  id: WeightEntryId;
  date: DateString;
  weight: number;           // kg
  bodyFatPercentage?: number;
  notes?: string;
  createdAt: string;
}
```

---

### 4.8 GamificationState

```typescript
export interface GamificationState {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastLoggedDate: DateString | null;
  unlockedAchievements: AchievementId[];
  stats: GamificationStats;
  updatedAt: string;
}

export interface GamificationStats {
  totalMealsLogged: number;
  totalCaloriesLogged: number;
  totalWeightEntries: number;
  proteinGoalHitCount: number;
  waterGoalHitCount: number;
  daysLogged: number;
}
```

---

### 4.9 Achievement

```typescript
export type AchievementCategory =
  | 'logging'
  | 'streak'
  | 'nutrition'
  | 'weight'
  | 'milestone';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  xpReward: number;
  condition: AchievementCondition;
}

export type AchievementCondition =
  | { type: 'meals_logged'; count: number }
  | { type: 'streak'; days: number }
  | { type: 'protein_goal_hit'; count: number }
  | { type: 'water_goal_hit'; days: number }
  | { type: 'weight_change'; kg: number }
  | { type: 'level'; level: number }
  | { type: 'first_meal' };
```

---

### 4.10 AppSettings

```typescript
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  waterQuickAdds: number[];       // ml values, default [250, 500, 1000]
  defaultMealType: MealType;
  reminders: Reminder[];
  hasCompletedOnboarding: boolean;
  hasSeededData: boolean;
  locale: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  type: 'water' | 'meal' | 'weight';
  label: string;
  time: string;           // HH:mm
  enabled: boolean;
  daysOfWeek: number[];   // 0=Sun, 6=Sat
}
```

---

## 5. Aggregate Roots

| Aggregate | Root Entity | Consistency Boundary |
|-----------|-------------|---------------------|
| User | `UserProfile` | Profile + goals |
| Nutrition | `Meal` | Meal + triggers DailyLog update |
| Daily | `DailyLog` | Summary per date |
| Body | `WeightEntry` | Weight history |
| Progress | `GamificationState` | XP, streaks, achievements |
| Library | `Food` | Food catalog |

---

## 6. Domain Events

```typescript
export type DomainEvent =
  | { type: 'MEAL_LOGGED'; payload: { mealId: MealId; date: DateString; macros: Macros } }
  | { type: 'MEAL_DELETED'; payload: { mealId: MealId; date: DateString; macros: Macros } }
  | { type: 'WATER_ADDED'; payload: { date: DateString; amount: number } }
  | { type: 'WEIGHT_LOGGED'; payload: { entryId: WeightEntryId; weight: number } }
  | { type: 'GOAL_ACHIEVED'; payload: { date: DateString; goalType: 'calories' | 'protein' | 'water' } }
  | { type: 'ACHIEVEMENT_UNLOCKED'; payload: { achievementId: AchievementId; xpReward: number } }
  | { type: 'STREAK_UPDATED'; payload: { current: number; longest: number } }
  | { type: 'PROFILE_UPDATED'; payload: { profileId: UserProfileId } };
```

Events are dispatched by services and handled by `GamificationService`, `StreakService`, etc.

---

## 7. Domain Services (Pure Logic)

### 7.1 GoalCalculationService

```typescript
export class GoalCalculationService {
  static calculateBMR(profile: Pick<UserProfile, 'gender' | 'age' | 'weight' | 'height'>): number {
    // Mifflin-St Jeor
    const { gender, age, weight, height } = profile;
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    }
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }

  static calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
    const multipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    return Math.round(bmr * multipliers[activityLevel]);
  }

  static calculateTargets(profile: UserProfile): GoalTargets {
    const bmr = this.calculateBMR(profile);
    const tdee = this.calculateTDEE(bmr, profile.activityLevel);
    let calories = tdee;

    if (!profile.useCustomTargets) {
      switch (profile.goalType) {
        case 'weight_loss':
          calories = tdee - (profile.calorieAdjustment || 500);
          break;
        case 'weight_gain':
          calories = tdee + (profile.calorieAdjustment || 300);
          break;
        case 'maintenance':
          calories = tdee;
          break;
      }
    } else {
      calories = profile.dailyCalories;
    }

    const protein = profile.useCustomTargets
      ? profile.dailyProtein
      : Math.round((calories * 0.3) / 4);
    const carbs = profile.useCustomTargets
      ? profile.dailyCarbs
      : Math.round((calories * 0.4) / 4);
    const fat = profile.useCustomTargets
      ? profile.dailyFat
      : Math.round((calories * 0.3) / 9);

    return {
      dailyCalories: calories,
      dailyProtein: protein,
      dailyCarbs: carbs,
      dailyFat: fat,
      dailyWater: profile.dailyWater || 2500,
    };
  }
}
```

### 7.2 StreakService

```typescript
export class StreakService {
  static updateStreak(
    state: GamificationState,
    loggedDate: DateString
  ): GamificationState {
    const { lastLoggedDate, currentStreak, longestStreak } = state;

    if (lastLoggedDate === loggedDate) return state;

    const yesterday = subtractDays(loggedDate, 1);
    let newStreak: number;

    if (lastLoggedDate === yesterday) {
      newStreak = currentStreak + 1;
    } else if (lastLoggedDate === null) {
      newStreak = 1;
    } else {
      newStreak = 1; // streak broken
    }

    return {
      ...state,
      currentStreak: newStreak,
      longestStreak: Math.max(longestStreak, newStreak),
      lastLoggedDate: loggedDate,
    };
  }
}
```

### 7.3 GamificationService (rules)

```typescript
export const XP_REWARDS = {
  LOG_MEAL: 10,
  HIT_CALORIE_GOAL: 25,
  HIT_PROTEIN_GOAL: 15,
  LOG_WATER: 5,
  LOG_WEIGHT: 10,
  DAILY_STREAK: 20,
} as const;

export function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100));
}

export function xpForNextLevel(level: number): number {
  return (level + 1) ** 2 * 100;
}
```

---

## 8. Zod Schemas (Boundary Validation)

Schemas live in `src/domain/schemas/` and mirror entities:

```typescript
export const FoodSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  brand: z.string().max(100).optional(),
  servingSize: z.number().positive(),
  servingUnit: z.enum(['g', 'ml', 'oz', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'serving', 'scoop']),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
  isFavorite: z.boolean(),
  tags: z.array(z.string()),
  isCustom: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

---

## 9. Entity Relationship Diagram

```
UserProfile (1) ─────────────────────────────── (1) AppSettings
     │
     │ targets used by
     ▼
DailyLog (1 per date) ◀── aggregated from ── Meal (N per date)
                              │
                              │ contains
                              ▼
                         MealFoodItem ──references──▶ Food (N)
                              │
MealTemplate ──references──▶ Food (N)

WeightEntry (N per user, 1 per date typical)

GamificationState (1) ── unlocks ──▶ Achievement (N)
```

---

## 10. Invariants

| Entity | Invariant |
|--------|-----------|
| Food | `calories >= 0`, all macros >= 0 |
| Meal | `totalCalories === sum(food.macros.calories)` |
| DailyLog | Totals match sum of meals for that date |
| WeightEntry | One entry per date (upsert on duplicate date) |
| GamificationState | `level === calculateLevel(totalXP)` |
| UserProfile | If `!useCustomTargets`, macros must match calculated values |
