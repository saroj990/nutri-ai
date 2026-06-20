"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FOOD_TAGS } from "@/lib/constants";
import { useFoodStore } from "@/stores/use-food-store";

export function FoodSearchBar() {
  const searchTerm = useFoodStore((s) => s.searchTerm);
  const activeTag = useFoodStore((s) => s.activeTag);
  const search = useFoodStore((s) => s.search);
  const setActiveTag = useFoodStore((s) => s.setActiveTag);
  const totalCount = useFoodStore((s) => s.totalCount);
  const searchResults = useFoodStore((s) => s.searchResults);

  const [localTerm, setLocalTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      search(localTerm, activeTag);
    }, 150);
    return () => clearTimeout(timer);
  }, [localTerm, activeTag, search]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={localTerm}
          onChange={(e) => setLocalTerm(e.target.value)}
          placeholder="Search foods by name, brand, or tag..."
          className="pl-9 pr-9"
          aria-label="Search foods"
        />
        {localTerm && (
          <button
            type="button"
            onClick={() => setLocalTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {FOOD_TAGS.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => setActiveTag(tag.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeTag === tag.id
                ? "border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {tag.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {searchResults.length} of {totalCount} foods
      </p>
    </div>
  );
}
