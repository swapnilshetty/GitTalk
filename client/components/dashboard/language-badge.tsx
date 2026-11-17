import { LanguageIcon } from "@/components/icons/language-icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function LanguageBadge({
  language,
  className,
  showLabel = true,
}: {
  language: string | null;
  className?: string;
  showLabel?: boolean;
}) {
  const label = language?.trim() || "Code";

  return (
    <Badge
      variant="secondary"
      className={cn(
        "inline-flex items-center gap-1.5 border-border/60 bg-muted/50 text-muted-foreground",
        className,
      )}
    >
      <span className="flex size-4 items-center justify-center rounded-md bg-background/80 text-foreground">
        <LanguageIcon className="size-3" />
      </span>
      {showLabel && <span>{label}</span>}
    </Badge>
  );
}
