"use client";

import { useMemo, useState } from "react";
import { FolderGit2 } from "lucide-react";

import { DashboardHeader, type FilterStatus } from "@/components/dashboard/dashboard-header";
import { RepoCard } from "@/components/dashboard/repo-card";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useRefreshRepos, useRepos } from "@/hooks/use-repos";

export function RepoDashboard() {
  const {
    data: repos = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useRepos();
  const { mutate: syncRepos, isPending: isSyncing } = useRefreshRepos();

  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState<"all" | "public" | "private">("all");
  const [status, setStatus] = useState<FilterStatus>("ALL");

  const filteredRepos = useMemo(() => {
    const query = search.trim().toLowerCase();

    return repos.filter((repo) => {
      const matchesQuery =
        !query ||
        repo.name.toLowerCase().includes(query) ||
        repo.fullName.toLowerCase().includes(query) ||
        (repo.description ?? "").toLowerCase().includes(query);

      const matchesVisibility =
        visibility === "all" ||
        (visibility === "public" && !repo.isPrivate) ||
        (visibility === "private" && repo.isPrivate);

      const matchesStatus =
        status === "ALL" || repo.indexStatus === status;

      return matchesQuery && matchesVisibility && matchesStatus;
    });
  }, [repos, search, visibility, status]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-20 animate-pulse rounded-2xl bg-muted/80" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-2xl bg-muted/60" />
          ))}
        </div>
      </div>
    );
  }

  if (isError && repos.length === 0) {
    return (
      <div className="flex min-h-full flex-col">
        <div className="border-b border-border/70 px-5 py-5 sm:px-7">
          <h1 className="text-xl font-semibold tracking-tight">Repositories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your GitHub repositories could not be loaded.
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center p-5 sm:p-6">
          <Empty className="min-h-[320px] max-w-xl border-border/60 bg-card/50">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderGit2 className="size-5" />
              </EmptyMedia>
              <EmptyTitle>Unable to load repositories</EmptyTitle>
              <EmptyDescription>
                {error instanceof Error
                  ? error.message
                  : "Check your connection and try again."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button type="button" onClick={() => void refetch()}>
                Try again
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <DashboardHeader
        search={search}
        onSearchChange={setSearch}
        visibility={visibility}
        onVisibilityChange={setVisibility}
        status={status}
        onStatusChange={setStatus}
        totalCount={repos.length}
        readyCount={repos.filter((repo) => repo.indexStatus === "READY").length}
        onSync={() => syncRepos()}
        isSyncing={isSyncing}
      />

      <div className="flex-1 p-5 sm:p-6">
        {filteredRepos.length === 0 ? (
          <Empty className="min-h-[420px] border-border/60 bg-card/50">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderGit2 className="size-5" />
              </EmptyMedia>
              <EmptyTitle>
                {repos.length === 0
                  ? "No repositories connected"
                  : "No repositories found"}
              </EmptyTitle>
              <EmptyDescription>
                {repos.length === 0
                  ? "Sync your GitHub repositories to choose a codebase to index and chat with."
                  : "Try changing your search or filters to find a repository."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {repos.length === 0 ? (
                <Button type="button" onClick={() => syncRepos()} disabled={isSyncing}>
                  {isSyncing ? "Syncing..." : "Sync repositories"}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setVisibility("all");
                    setStatus("ALL");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </EmptyContent>
          </Empty>
        ) : (
          <div className="mx-auto grid w-full max-w-[1500px] gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredRepos.map((repo) => <RepoCard key={repo.id} repo={repo} />)}
          </div>
        )}
      </div>
    </div>
  );
}
