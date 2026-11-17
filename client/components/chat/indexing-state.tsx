"use client";

import { AlertCircle, CheckCircle2, LoaderCircle, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useStartIndexing, getRepoProgress } from "@/hooks/use-repos";
import type { Repository } from "@/lib/api";

export function IndexingState({ repository }: { repository: Repository }) {
  const startIndexing = useStartIndexing();
  const progress = getRepoProgress(repository);
  const hasFailed = repository.indexStatus === "FAILED";
  const isPending = repository.indexStatus === "PENDING";

  return (
    <main className="flex min-h-[60vh] flex-1 items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-primary">
          {hasFailed ? (
            <AlertCircle className="size-6 text-destructive" aria-hidden="true" />
          ) : repository.indexStatus === "READY" ? (
            <CheckCircle2 className="size-6" aria-hidden="true" />
          ) : (
            <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
          )}
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-tight">
          {hasFailed
            ? "Repository indexing failed"
            : isPending
              ? "Getting your repository ready"
              : "Indexing your repository"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {hasFailed
            ? repository.errorMessage ||
              "The repository could not be indexed. Retry indexing to continue to chat."
            : `${repository.fullName} is being prepared so GitTalk can find relevant code and cite the source files.`}
        </p>

        {!hasFailed && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {repository.filesProcessed.toLocaleString()} of{" "}
                {repository.filesTotal.toLocaleString()} files
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} aria-label="Repository indexing progress" />
          </div>
        )}

        {hasFailed && (
          <Button
            type="button"
            className="mt-6"
            disabled={startIndexing.isPending}
            onClick={() => startIndexing.mutate(repository.id)}
          >
            <RotateCw aria-hidden="true" />
            {startIndexing.isPending ? "Retrying..." : "Retry indexing"}
          </Button>
        )}
      </section>
    </main>
  );
}
