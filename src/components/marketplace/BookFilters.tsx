"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { BOOK_CONDITIONS } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Category } from "@/types/database";

interface BookFiltersProps {
  categories: Category[];
}

export function BookFilters({ categories }: BookFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [condition, setCondition] = useState(searchParams.get("condition") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  function applyFilters(overrides?: Record<string, string>) {
    const params = new URLSearchParams();
    const next = {
      q: query.trim(),
      category,
      condition,
      maxPrice: maxPrice.trim(),
      sort,
      ...overrides,
    };

    if (next.q) params.set("q", next.q);
    if (next.category) params.set("category", next.category);
    if (next.condition) params.set("condition", next.condition);
    if (next.maxPrice) params.set("maxPrice", next.maxPrice);
    if (next.sort && next.sort !== "newest") params.set("sort", next.sort);

    const qs = params.toString();
    router.push(qs ? `/marketplace?${qs}` : "/marketplace");
  }

  function clearFilters() {
    setQuery("");
    setCategory("");
    setCondition("");
    setMaxPrice("");
    setSort("newest");
    router.push("/marketplace");
  }

  const hasFilters = Boolean(
    query || category || condition || maxPrice || sort !== "newest"
  );

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters();
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by book title, author, or subject..."
            className="pl-9"
            aria-label="Search books"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            applyFilters({ category: e.target.value });
          }}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>

        <Select
          value={condition}
          onChange={(e) => {
            setCondition(e.target.value);
            applyFilters({ condition: e.target.value });
          }}
          aria-label="Filter by condition"
        >
          <option value="">Any Condition</option>
          {BOOK_CONDITIONS.map((cond) => (
            <option key={cond} value={cond}>
              {cond}
            </option>
          ))}
        </Select>

        <Input
          type="number"
          min={0}
          placeholder="Max price (NPR)"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          onBlur={() => applyFilters()}
          aria-label="Maximum price in NPR"
        />

        <Select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            applyFilters({ sort: e.target.value });
          }}
          aria-label="Sort books"
        >
          <option value="newest">Sort: Newest First</option>
          <option value="price_asc">Sort: Lowest Price</option>
        </Select>
      </div>

      {/* Popular Category Quick Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-medium text-muted-foreground">
          Categories:
        </span>
        {categories.map((cat) => {
          const active = category === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                const next = active ? "" : cat.id;
                setCategory(next);
                applyFilters({ category: next });
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              }`}
            >
              {cat.name}
            </button>
          );
        })}

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
