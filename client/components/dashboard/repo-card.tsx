"use client";

import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  FolderGit2,
  GitBranch,
  Lock,
  MessageSquareText,
} from "lucide-react";

import { IndexErrorAlert } from "@/components/dashboard/index-error-alert";
import { LanguageBadge } from "@/components/dashboard/language-badge";
import { IndexStatusBadge } from "@/components/dashboard/repo-status";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Repository } from "@/lib/api";
import { getRepoProgress, useStartIndexing } from "@/hooks/use-repos";

export function RepoCard({ repo }: { repo: Repository }) {
  const { mutate: startIndexing, isPending } = useStartIndexing();
  const progress = getRepoProgress(repo);
  const isReady = repo.indexStatus === "READY";
  const isIndexing = repo.indexStatus === "INDEXING";
  const owner = repo.fullName.split("/")[0] || repo.owner;

  return (
    <Card className="flex min-h-56 flex-col overflow-hidden rounded-xl border-border/70 bg-card shadow-sm transition-colors hover:border-primary/40">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted text-primary">
              <FolderGit2 className="size-[18px]" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[11px] text-muted-foreground">{owner}</p>
              <h3 className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
                <span className="truncate">{repo.name}</span>
                {repo.isPrivate && <Lock className="size-3.5 shrink-0 text-muted-foreground" />}
              </h3>
            </div>
          </div>

          <div className="shrink-0">
            <IndexStatusBadge
              status={repo.indexStatus}
              className="px-2 py-0.5 text-[10px] normal-case tracking-normal"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 p-4 pt-0">
        <p className="line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">
          {repo.description || "No description provided."}
        </p>

        {repo.errorMessage && <IndexErrorAlert message={repo.errorMessage} />}

        {isIndexing && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                {repo.filesProcessed}/{repo.filesTotal} files indexed
              </span>
              <span>{progress}%</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2 py-1">
            <GitBranch className="size-3" />
            {repo.defaultBranch}
          </span>
          <LanguageBadge
            language={repo.language}
            className="border-0 bg-muted/60 px-2 py-1 text-[11px] text-muted-foreground"
          />
          <span className="rounded-full bg-muted/60 px-2 py-1">
            {repo.chunkCount} chunks
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/70 pt-3">
          {repo.htmlUrl ? (
            <Link
              href={repo.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className={
                buttonVariants({ variant: "ghost", size: "sm" }) +
                " h-7 gap-1.5 px-2 text-xs text-muted-foreground"
              }
            >
              <ExternalLink className="size-3" />
              GitHub
            </Link>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled
              className="h-7 px-2 text-xs"
            >
              <ExternalLink className="size-3" />
              GitHub
            </Button>
          )}

          <div className="flex items-center gap-1.5">
            {isReady && (
              <Link
                href={`/chat/${repo.id}`}
                className={
                  buttonVariants({ variant: "outline", size: "sm" }) +
                  " h-7 gap-1 px-2 text-xs"
                }
              >
                <MessageSquareText className="size-3" />
                Chat
              </Link>
            )}
            <Button
              type="button"
              size="sm"
              onClick={() => startIndexing(repo.id)}
              disabled={isIndexing || isPending}
              className="h-7 gap-1 rounded-md px-2.5 text-xs"
            >
              <ArrowRight className="size-3" />
              {isIndexing ? "Indexing..." : isReady ? "Reindex" : "Index"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
