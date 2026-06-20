export type ServingUnit =
  | "g"
  | "ml"
  | "oz"
  | "cup"
  | "tbsp"
  | "tsp"
  | "piece"
  | "slice"
  | "serving"
  | "scoop";

export interface ServingSize {
  amount: number;
  unit: ServingUnit;
}
