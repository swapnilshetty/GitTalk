"use client";

import { RefreshCcw, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import type { IndexStatus } from "@/lib/api";

export type FilterStatus = "ALL" | IndexStatus;

export type DashboardHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  visibility: "all" | "public" | "private";
  onVisibilityChange: (value: "all" | "public" | "private") => void;
  status: FilterStatus;
  onStatusChange: (value: FilterStatus) => void;
  totalCount: number;
  readyCount: number;
  onSync: () => void;
  isSyncing: boolean;
};

export function DashboardHeader({
  search,
  onSearchChange,
  visibility,
  onVisibilityChange,
  status,
  onStatusChange,
  totalCount,
  readyCount,
  onSync,
  isSyncing,
}: DashboardHeaderProps) {
  const visibilityOptions = [
    { value: "all", label: "All" },
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
  ] as const;
  const statusOptions: { value: FilterStatus; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "READY", label: "Ready" },
    { value: "INDEXING", label: "Indexing" },
    { value: "PENDING", label: "New" },
    { value: "FAILED", label: "Failed" },
  ];

  return (
    <div className="border-b border-border/70 bg-background">
      <div className="flex flex-col gap-5 px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Repositories</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{totalCount}</span> connected
            <span className="mx-1.5">·</span>
            <span className="font-medium text-foreground">{readyCount}</span> ready
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              aria-label="Search repositories"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search repositories..."
              className="h-9 w-full rounded-lg border border-input bg-card py-2 pl-9 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/80 focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSync}
            disabled={isSyncing}
            className="h-9 gap-2 rounded-lg"
          >
            <RefreshCcw className={isSyncing ? "size-4 animate-spin" : "size-4"} />
            {isSyncing ? "Syncing..." : "Sync"}
          </Button>

          <ModeToggle />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border/50 px-5 py-3 sm:flex-row sm:items-center sm:gap-8 sm:px-7">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <SlidersHorizontal className="size-3.5" />
            Visibility
          </span>
          <div className="flex items-center gap-1" role="group" aria-label="Filter by visibility">
            {visibilityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={visibility === option.value}
                aria-label={`Show ${option.label.toLowerCase()} repositories`}
                onClick={() => onVisibilityChange(option.value)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  visibility === option.value
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Status</span>
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Filter by status">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={status === option.value}
                aria-label={`Show ${option.label.toLowerCase()} repositories`}
                onClick={() => onStatusChange(option.value)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  status === option.value
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
