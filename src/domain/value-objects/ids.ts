export type FoodId = string & { readonly __brand: "FoodId" };
export type MealId = string & { readonly __brand: "MealId" };
export type DailyLogId = string & { readonly __brand: "DailyLogId" };
export type WeightEntryId = string & { readonly __brand: "WeightEntryId" };
export type UserProfileId = string & { readonly __brand: "UserProfileId" };
export type MealTemplateId = string & { readonly __brand: "MealTemplateId" };
export type AchievementId = string & { readonly __brand: "AchievementId" };

export const createFoodId = (): FoodId => crypto.randomUUID() as FoodId;
export const createMealId = (): MealId => crypto.randomUUID() as MealId;
export const createDailyLogId = (): DailyLogId => crypto.randomUUID() as DailyLogId;
export const createWeightEntryId = (): WeightEntryId =>
  crypto.randomUUID() as WeightEntryId;
export const createUserProfileId = (): UserProfileId =>
  crypto.randomUUID() as UserProfileId;
export const createMealTemplateId = (): MealTemplateId =>
  crypto.randomUUID() as MealTemplateId;
export const createAchievementId = (id: string): AchievementId =>
  id as AchievementId;
