export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const ZERO_MACROS: Macros = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function addMacros(a: Macros, b: Macros): Macros {
  return {
    calories: a.calories + b.calories,
    protein: round1(a.protein + b.protein),
    carbs: round1(a.carbs + b.carbs),
    fat: round1(a.fat + b.fat),
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

export function subtractMacros(a: Macros, b: Macros): Macros {
  return {
    calories: Math.max(0, a.calories - b.calories),
    protein: round1(Math.max(0, a.protein - b.protein)),
    carbs: round1(Math.max(0, a.carbs - b.carbs)),
    fat: round1(Math.max(0, a.fat - b.fat)),
  };
}
