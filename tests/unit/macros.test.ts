import { describe, it, expect } from "vitest";
import { addMacros, scaleMacros, ZERO_MACROS } from "@/domain/value-objects/macros";

describe("Macros value object", () => {
  it("adds macros correctly", () => {
    const result = addMacros(
      { calories: 100, protein: 10, carbs: 20, fat: 5 },
      { calories: 50, protein: 5, carbs: 10, fat: 2 },
    );
    expect(result.calories).toBe(150);
    expect(result.protein).toBe(15);
    expect(result.carbs).toBe(30);
    expect(result.fat).toBe(7);
  });

  it("scales macros by multiplier", () => {
    const result = scaleMacros(
      { calories: 100, protein: 10, carbs: 20, fat: 5 },
      1.5,
    );
    expect(result.calories).toBe(150);
    expect(result.protein).toBe(15);
  });

  it("has zero macros constant", () => {
    expect(ZERO_MACROS).toEqual({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
  });
});
