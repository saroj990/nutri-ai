import { describe, it, expect, beforeEach } from "vitest";
import { SearchService } from "@/services/search.service";
import { createFoodId } from "@/domain/value-objects/ids";
import type { Food } from "@/domain/entities/food";

function makeFood(overrides: Partial<Food> & Pick<Food, "name">): Food {
  const now = new Date().toISOString();
  return {
    id: createFoodId(),
    servingSize: 100,
    servingUnit: "g",
    calories: 100,
    protein: 10,
    carbs: 10,
    fat: 5,
    isFavorite: false,
    tags: [],
    isCustom: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("SearchService", () => {
  let service: SearchService;
  const foods: Food[] = [
    makeFood({ name: "Chicken Breast", tags: ["protein"], protein: 31 }),
    makeFood({ name: "Basmati Rice", tags: ["indian", "carb"], carbs: 25 }),
    makeFood({ name: "Paneer Tikka", brand: "Haldiram's", tags: ["indian", "protein"] }),
    makeFood({ name: "Greek Yogurt", tags: ["dairy", "protein"], isFavorite: true }),
  ];

  beforeEach(() => {
    service = new SearchService();
    service.buildIndex(foods);
  });

  it("returns all foods sorted when no query", () => {
    const results = service.search({});
    expect(results).toHaveLength(4);
    expect(results[0]?.name).toBe("Basmati Rice");
  });

  it("searches by name with fuzzy matching", () => {
    const results = service.search({ term: "chicken" });
    expect(results.some((f) => f.name.includes("Chicken"))).toBe(true);
  });

  it("filters favorites only", () => {
    const results = service.search({ favoritesOnly: true });
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe("Greek Yogurt");
  });

  it("filters by tag", () => {
    const results = service.search({ tags: ["indian"] });
    expect(results).toHaveLength(2);
  });

  it("filters custom only", () => {
    const custom = makeFood({ name: "My Recipe", isCustom: true });
    service.buildIndex([...foods, custom]);
    const results = service.search({ customOnly: true });
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe("My Recipe");
  });

  it("respects limit", () => {
    const results = service.search({ limit: 2 });
    expect(results).toHaveLength(2);
  });
});
