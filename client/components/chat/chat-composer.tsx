"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatComposer({
  onSend,
  disabled = false,
  isSending = false,
  placeholder = "Ask a question about this repository...",
}: {
  onSend: (content: string) => void;
  disabled?: boolean;
  isSending?: boolean;
  placeholder?: string;
}) {
  const [content, setContent] = useState("");

  function submitMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const message = content.trim();
    if (!message || disabled || isSending) return;
    onSend(message);
    setContent("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      submitMessage();
    }
  }

  return (
    <form
      onSubmit={submitMessage}
      className="mx-auto w-full max-w-4xl px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="rounded-2xl border border-border/80 bg-card shadow-sm transition-colors focus-within:border-ring/70 focus-within:ring-3 focus-within:ring-ring/10">
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Message"
          rows={2}
          className="max-h-48 min-h-20 resize-none border-0 bg-transparent px-4 pt-4 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
        />
        <div className="flex items-center justify-between gap-3 px-3 pb-3">
          <span className="px-1 text-xs text-muted-foreground">
            Enter to send · Shift + Enter for a new line
          </span>
          <Button
            type="submit"
            size="icon-sm"
            disabled={disabled || isSending || !content.trim()}
            aria-label={isSending ? "Assistant is responding" : "Send message"}
            title="Send message"
          >
            {isSending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <ArrowUp />
            )}
          </Button>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        AI responses can be inaccurate. Verify important details in the cited code.
      </p>
    </form>
  );
}
