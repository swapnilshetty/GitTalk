"use client";

import { FileCode2 } from "lucide-react";

import type { Citation, Repository } from "@/lib/api";
import { cn } from "@/lib/utils";

function getCitationHref(repository: Repository, citation: Citation) {
  if (!repository.htmlUrl) return undefined;

  const filePath = citation.filePath
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  const baseUrl = `${repository.htmlUrl.replace(/\/$/, "")}/blob/${encodeURIComponent(repository.defaultBranch)}/${filePath}`;

  return citation.startLine ? `${baseUrl}#L${citation.startLine}` : baseUrl;
}

export function CitationChips({
  citations,
  repository,
  className,
}: {
  citations: Citation[];
  repository: Repository;
  className?: string;
}) {
  if (citations.length === 0) return null;

  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      aria-label="Source files"
    >
      {citations.map((citation, index) => {
        const href = getCitationHref(repository, citation);
        const lineLabel =
          citation.startLine == null
            ? ""
            : citation.endLine != null &&
                citation.endLine !== citation.startLine
              ? `:${citation.startLine}-${citation.endLine}`
              : `:${citation.startLine}`;
        const label = `${citation.filePath}${lineLabel}`;
        const chipClassName =
          "inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border/70 bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted hover:text-foreground";
        const content = (
          <>
            <FileCode2 className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </>
        );

        return href ? (
          <a
            key={`${citation.filePath}-${citation.startLine}-${index}`}
            className={chipClassName}
            href={href}
            target="_blank"
            rel="noreferrer"
            title={label}
          >
            {content}
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : (
          <span
            key={`${citation.filePath}-${citation.startLine}-${index}`}
            className={chipClassName}
            title={label}
          >
            {content}
          </span>
        );
      })}
    </div>
  );
}
