"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Search, X } from "lucide-react";
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
    <div className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs">
      {/* Row 1: Simple Search + Quick Filters */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters();
          }}
          className="flex gap-2 lg:col-span-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search book title, author, or subject..."
              className="pl-10 h-11"
              aria-label="Search books"
            />
          </div>
          <Button type="submit" className="h-11 px-6">
            Search
          </Button>
        </form>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-6">
          <Select
            value={condition}
            onChange={(e) => {
              setCondition(e.target.value);
              applyFilters({ condition: e.target.value });
            }}
            className="h-11"
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
            className="h-11"
            aria-label="Maximum price in NPR"
          />

          <Select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              applyFilters({ sort: e.target.value });
            }}
            className="h-11"
            aria-label="Sort books"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Lowest Price</option>
          </Select>
        </div>
      </div>

      {/* Row 2: Distinct Active vs Inactive Category Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => {
            setCategory("");
            applyFilters({ category: "" });
          }}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            category === ""
              ? "bg-[#065f46] text-white shadow-sm"
              : "bg-[#e6f4ec] text-[#064e3b] hover:bg-[#d1ebdc]"
          }`}
        >
          {category === "" && <Check className="h-3.5 w-3.5" />}
          All Books
        </button>

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
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? "bg-[#065f46] text-white shadow-sm"
                  : "bg-[#e6f4ec] text-[#064e3b] hover:bg-[#d1ebdc]"
              }`}
            >
              {active && <Check className="h-3.5 w-3.5" />}
              {cat.name}
            </button>
          );
        })}

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto inline-flex items-center gap-1 rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
