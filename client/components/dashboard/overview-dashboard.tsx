"use client";

import { Activity, FolderGit2, LoaderCircle, MessageSquareText } from "lucide-react";

import { RepoCard } from "@/components/dashboard/repo-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRepos } from "@/hooks/use-repos";

export function OverviewDashboard() {
  const { data: repos = [], isLoading } = useRepos();

  const total = repos.length;
  const ready = repos.filter((repo) => repo.indexStatus === "READY").length;
  const indexing = repos.filter((repo) => repo.indexStatus === "INDEXING").length;
  const failed = repos.filter((repo) => repo.indexStatus === "FAILED").length;

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total repos</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-semibold text-foreground">{isLoading ? "--" : total}</span>
            <FolderGit2 className="size-5 text-primary" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Ready</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-semibold text-foreground">{ready}</span>
            <Activity className="size-5 text-emerald-500" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Indexing</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-semibold text-foreground">{indexing}</span>
            <LoaderCircle className="size-5 text-amber-500" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Failed</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-semibold text-foreground">{failed}</span>
            <MessageSquareText className="size-5 text-red-500" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-64 animate-pulse rounded-2xl bg-muted/60" />
            ))}
          </div>
        ) : (
          repos.slice(0, 4).map((repo) => <RepoCard key={repo.id} repo={repo} />)
        )}
      </div>
    </div>
  );
}
