import Fuse from "fuse.js";
import type { Food } from "@/domain/entities/food";

export interface SearchOptions {
  term?: string;
  favoritesOnly?: boolean;
  tags?: string[];
  customOnly?: boolean;
  recentIds?: string[];
  limit?: number;
}

export class SearchService {
  private fuse: Fuse<Food> | null = null;
  private foods: Food[] = [];

  buildIndex(foods: Food[]): void {
    this.foods = foods;
    this.fuse = new Fuse(foods, {
      keys: [
        { name: "name", weight: 0.6 },
        { name: "brand", weight: 0.25 },
        { name: "tags", weight: 0.15 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });
  }

  search(options: SearchOptions): Food[] {
    let results: Food[];

    if (options.term?.trim() && this.fuse) {
      results = this.fuse.search(options.term.trim()).map((r) => r.item);
    } else {
      results = [...this.foods].sort((a, b) => a.name.localeCompare(b.name));
    }

    if (options.favoritesOnly) {
      results = results.filter((f) => f.isFavorite);
    }

    if (options.customOnly) {
      results = results.filter((f) => f.isCustom);
    }

    if (options.tags?.length) {
      results = results.filter((f) =>
        options.tags!.some((tag) => f.tags.includes(tag)),
      );
    }

    if (options.recentIds?.length) {
      const order = new Map(options.recentIds.map((id, i) => [id, i]));
      results = results
        .filter((f) => order.has(f.id))
        .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    }

    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  getIndexedCount(): number {
    return this.foods.length;
  }
}

export const searchService = new SearchService();
