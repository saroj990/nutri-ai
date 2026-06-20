import type { Meal, MealFoodItem, MealType } from "@/domain/entities/meal";
import { computeMealTotals, MEAL_TYPE_LABELS } from "@/domain/entities/meal";
import type { MealTemplate } from "@/domain/entities/meal-template";
import type { DailyLog } from "@/domain/entities/daily-log";
import type { Food } from "@/domain/entities/food";
import { getFoodMacros } from "@/domain/entities/food";
import type { DateString } from "@/domain/value-objects/date";
import type { MealFoodItemInput } from "@/domain/schemas/meal.schema";
import {
  createMealId,
  createMealTemplateId,
} from "@/domain/value-objects/ids";
import type { RepositoryContainer } from "@/infrastructure/di/container";
import { GamificationService } from "@/services/gamification.service";

export interface LogMealInput {
  id?: string;
  name?: string;
  mealType: MealType;
  date: DateString;
  foods: MealFoodItemInput[];
  notes?: string;
}

export class MealLoggingService {
  constructor(
    private repos: RepositoryContainer,
    private gamification: GamificationService,
  ) {}

  async logMeal(input: LogMealInput): Promise<Meal> {
    const foodItems = await this.buildMealFoodItems(input.foods);
    const totals = computeMealTotals(foodItems);
    const now = new Date().toISOString();
    const existing = input.id
      ? await this.repos.meal.getById(input.id)
      : null;

    const meal: Meal = {
      id: (input.id as Meal["id"]) ?? createMealId(),
      name: input.name ?? MEAL_TYPE_LABELS[input.mealType],
      mealType: input.mealType,
      date: input.date,
      foods: foodItems,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      notes: input.notes,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await this.repos.meal.save(meal);

    for (const item of foodItems) {
      await this.repos.food.trackRecent(item.foodId);
    }

    const dailyLog = await this.recomputeDailyLog(input.date);
    await this.gamification.onMealLogged(meal, dailyLog);

    return meal;
  }

  async deleteMeal(mealId: string): Promise<void> {
    const meal = await this.repos.meal.getById(mealId);
    if (!meal) return;

    await this.repos.meal.delete(mealId);
    await this.recomputeDailyLog(meal.date);
  }

  async duplicateMeal(
    mealId: string,
    targetDate: DateString,
  ): Promise<Meal> {
    const source = await this.repos.meal.getById(mealId);
    if (!source) throw new Error("Meal not found");

    return this.logMeal({
      name: source.name,
      mealType: source.mealType,
      date: targetDate,
      foods: source.foods.map((f) => ({
        foodId: f.foodId,
        servings: f.servings,
      })),
      notes: source.notes,
    });
  }

  async saveTemplate(
    name: string,
    mealType: MealType,
    foods: MealFoodItemInput[],
  ): Promise<MealTemplate> {
    const now = new Date().toISOString();
    const template: MealTemplate = {
      id: createMealTemplateId(),
      name,
      mealType,
      foods: foods.map((f) => ({
        foodId: f.foodId as MealTemplate["foods"][0]["foodId"],
        servings: f.servings,
      })),
      createdAt: now,
      updatedAt: now,
    };
    await this.repos.meal.saveTemplate(template);
    return template;
  }

  async instantiateTemplate(
    templateId: string,
    date: DateString,
  ): Promise<Meal> {
    const template = await this.repos.meal.getTemplateById(templateId);
    if (!template) throw new Error("Template not found");

    return this.logMeal({
      name: template.name,
      mealType: template.mealType,
      date,
      foods: template.foods.map((f) => ({
        foodId: f.foodId,
        servings: f.servings,
      })),
    });
  }

  async recomputeDailyLog(date: DateString): Promise<DailyLog> {
    const meals = await this.repos.meal.getByDate(date);
    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.totalCalories,
        protein: acc.protein + meal.totalProtein,
        carbs: acc.carbs + meal.totalCarbs,
        fat: acc.fat + meal.totalFat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    return this.repos.dailyLog.upsertPartial(date, {
      caloriesConsumed: totals.calories,
      proteinConsumed: Math.round(totals.protein * 10) / 10,
      carbsConsumed: Math.round(totals.carbs * 10) / 10,
      fatConsumed: Math.round(totals.fat * 10) / 10,
      mealCount: meals.length,
    });
  }

  private async buildMealFoodItems(
    inputs: MealFoodItemInput[],
  ): Promise<MealFoodItem[]> {
    const items: MealFoodItem[] = [];

    for (const input of inputs) {
      const food = await this.repos.food.getById(input.foodId);
      if (!food) throw new Error(`Food not found: ${input.foodId}`);

      items.push({
        foodId: food.id,
        foodName: food.name,
        servings: input.servings,
        macros: getFoodMacros(food, input.servings),
      });
    }

    return items;
  }
}

export function createMealLoggingService(
  repos: RepositoryContainer,
): MealLoggingService {
  return new MealLoggingService(repos, new GamificationService(repos));
}
