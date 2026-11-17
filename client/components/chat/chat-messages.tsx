"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, Bot, CircleAlert, UserRound } from "lucide-react";

import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { CitationChips } from "@/components/chat/citation-chips";
import { Button } from "@/components/ui/button";
import type { ChatMessage, Repository } from "@/lib/api";

const suggestedPrompts = [
  "How is this project structured?",
  "Where is authentication handled?",
  "Explain the main application flow.",
];

export function ChatMessages({
  messages,
  repository,
  isLoading = false,
  error,
  onRetry,
  onSuggestedPrompt,
}: {
  messages: ChatMessage[];
  repository: Repository;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSuggestedPrompt?: (prompt: string) => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isFollowingRef = useRef(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isFollowingRef.current) return;

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className={`flex gap-3 ${item === 1 ? "flex-row-reverse" : ""}`}
          >
            <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="h-16 w-3/4 animate-pulse rounded-2xl bg-muted/70" />
          </div>
        ))}
        <span className="sr-only" role="status">Loading conversation…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="flex max-w-md flex-col items-center gap-3 text-center">
          <CircleAlert className="size-8 text-destructive" aria-hidden="true" />
          <h2 className="font-medium">Could not load this conversation</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          {onRetry && (
            <Button type="button" variant="outline" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-5 py-10">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
          <div className="mb-5 flex size-12 items-center justify-center rounded-2xl border bg-card shadow-sm">
            <Bot className="size-6 text-primary" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Ask {repository.name} anything
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Explore the codebase with answers grounded in its indexed files.
            Relevant sources will be linked below each answer.
          </p>
          <div className="mt-7 grid w-full gap-2 sm:grid-cols-3">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={!onSuggestedPrompt}
                onClick={() => onSuggestedPrompt?.(prompt)}
                className="rounded-xl border bg-card px-3 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/60 hover:text-foreground disabled:cursor-default disabled:hover:border-border disabled:hover:bg-card disabled:hover:text-muted-foreground"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 justify-center">
      <div
        ref={scrollContainerRef}
        className="min-h-0 w-full overflow-y-auto overscroll-contain"
        onScroll={(event) => {
          const container = event.currentTarget;
          const isAtBottom =
            container.scrollHeight -
              container.scrollTop -
              container.clientHeight <
            96;
          isFollowingRef.current = isAtBottom;
          setShowScrollButton(!isAtBottom);
        }}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-relevant="additions text"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-7 px-4 py-7 sm:px-6">
          {messages.map((message) => {
            const isUser = message.role === "USER";
            const isPending = !isUser && !message.content;

            return (
              <article
                key={message.id}
                className={`flex min-w-0 gap-3 ${isUser ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "border bg-card text-primary"
                  }`}
                  aria-hidden="true"
                >
                  {isUser ? (
                    <UserRound className="size-4" />
                  ) : (
                    <Bot className="size-4" />
                  )}
                </div>
                <div
                  className={`flex min-w-0 max-w-[calc(100%-2.75rem)] flex-col gap-2 ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  <div className="text-xs font-medium text-muted-foreground">
                    {isUser ? "You" : "GitTalk"}
                  </div>
                  {isUser ? (
                    <div className="max-w-full whitespace-pre-wrap rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground">
                      {message.content}
                    </div>
                  ) : isPending ? (
                    <div
                      className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground"
                      role="status"
                    >
                      <span className="flex gap-1" aria-hidden="true">
                        <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.2s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-current" />
                        <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.1s]" />
                      </span>
                      Thinking…
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0 max-w-full">
                        <ChatMarkdown content={message.content} />
                      </div>
                      <CitationChips
                        citations={message.citations}
                        repository={repository}
                      />
                    </>
                  )}
                  <time
                    className="text-[11px] text-muted-foreground/80"
                    dateTime={message.createdAt}
                    suppressHydrationWarning
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      {showScrollButton && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border shadow-md"
          onClick={() => {
            isFollowingRef.current = true;
            setShowScrollButton(false);
            scrollContainerRef.current?.scrollTo({
              top: scrollContainerRef.current.scrollHeight,
              behavior: "smooth",
            });
          }}
        >
          <ArrowDown aria-hidden="true" />
          Latest message
        </Button>
      )}
    </div>
  );
}
