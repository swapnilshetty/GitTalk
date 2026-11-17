"use client";

import { Plus, MessageSquareText, FolderGit2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatSession, Repository } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ChatSidebar({
  repository,
  sessions,
  selectedSessionId,
  isLoading = false,
  isCreating = false,
  onCreate,
  onSelect,
  className,
}: {
  repository: Repository;
  sessions: ChatSession[];
  selectedSessionId: string | null;
  isLoading?: boolean;
  isCreating?: boolean;
  onCreate: () => void;
  onSelect: (sessionId: string) => void;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-72 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground",
        className
      )}
      aria-label="Chat history"
    >
      <div className="border-b p-4">
        <Link
          href="/dashboard"
          className="inline-flex min-w-0 items-center gap-2 rounded-lg text-sm font-medium outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
        >
          <FolderGit2 className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{repository.fullName}</span>
        </Link>
        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full justify-start"
          onClick={onCreate}
          disabled={isCreating}
        >
          <Plus aria-hidden="true" />
          {isCreating ? "Creating chat..." : "New chat"}
        </Button>
      </div>

      <div className="px-4 pt-5 pb-2 text-xs font-semibold tracking-wide text-muted-foreground">
        RECENT CHATS
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-1 px-2 pb-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="mx-2 h-10 animate-pulse rounded-lg bg-muted/60"
              />
            ))
          ) : sessions.length > 0 ? (
            sessions.map((session) => {
              const isSelected = session.id === selectedSessionId;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => onSelect(session.id)}
                  aria-current={isSelected ? "page" : undefined}
                  className={cn(
                    "flex w-full min-w-0 items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected && "bg-sidebar-accent font-medium text-foreground"
                  )}
                >
                  <MessageSquareText
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="truncate">{session.title}</span>
                </button>
              );
            })
          ) : (
            <p className="px-3 py-5 text-center text-xs leading-5 text-muted-foreground">
              No conversations yet. Start a new chat to ask about this repository.
            </p>
          )}
        </div>
      </ScrollArea>
      <div className="border-t px-4 py-3 text-xs text-muted-foreground">
        {sessions.length} {sessions.length === 1 ? "conversation" : "conversations"}
      </div>
    </aside>
  );
}
