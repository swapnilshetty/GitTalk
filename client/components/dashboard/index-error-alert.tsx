"use client";

import { useMemo, useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function getErrorSummary(message: string) {
  const trimmed = message.trim();
  if (trimmed.length <= 120) return trimmed;
  return `${trimmed.slice(0, 120).trim()}...`;
}

export function IndexErrorAlert({ message }: { message: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const summary = useMemo(() => getErrorSummary(message), [message]);
  const isTruncated = message.trim().length > summary.length;

  return (
    <Alert variant="destructive" className="relative overflow-hidden bg-destructive/5">
      <AlertCircle className="size-4" />
      <AlertTitle className="text-sm font-medium text-destructive">
        Indexing error
      </AlertTitle>
      <AlertDescription className="text-xs leading-relaxed text-destructive/90">
        {isExpanded ? message : summary}
      </AlertDescription>

      {isTruncated && (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="absolute right-3 top-3 inline-flex items-center gap-1 text-xs font-medium text-destructive/90 transition hover:text-destructive"
        >
          {isExpanded ? (
            <>
              Hide <ChevronUp className="size-3" />
            </>
          ) : (
            <>
              Read more <ChevronDown className="size-3" />
            </>
          )}
        </button>
      )}
    </Alert>
  );
}
