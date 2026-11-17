import { Badge } from "@/components/ui/badge";
import type { IndexStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<IndexStatus, string> = {
  PENDING: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  INDEXING: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  READY: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/25",
  FAILED: "bg-red-500/10 text-red-300 border-red-500/20",
};

const STATUS_LABELS: Record<IndexStatus, string> = {
  PENDING: "Not indexed",
  INDEXING: "Indexing",
  READY: "Ready",
  FAILED: "Failed",
};

export function IndexStatusBadge({
  status,
  className,
}: {
  status: IndexStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em]",
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
