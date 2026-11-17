"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Menu, MessageSquarePlus } from "lucide-react";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { IndexingState } from "@/components/chat/indexing-state";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useChatMessages, useChatSessions, useCreateChatSession, useSendChatMessage } from "@/hooks/use-chat";
import { useIndexStatus, useRepository } from "@/hooks/use-repos";
import type { Repository } from "@/lib/api";

const EMPTY_SESSIONS: [] = [];

function ErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-lg font-semibold">Could not open this repository</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </main>
  );
}

export default function ChatView({ repoId }: { repoId: string }) {
  const repositoryQuery = useRepository(repoId);
  const repository = repositoryQuery.data;
  const indexStatusQuery = useIndexStatus(
    repoId,
    Boolean(repository && repository.indexStatus !== "READY")
  );
  const effectiveIndexStatus =
    indexStatusQuery.data?.indexStatus ?? repository?.indexStatus;
  const sessionsQuery = useChatSessions(
    repoId,
    effectiveIndexStatus === "READY"
  );
  const createSession = useCreateChatSession();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const sessions = sessionsQuery.data ?? EMPTY_SESSIONS;
  const activeSessionId = useMemo(() => {
    if (selectedSessionId && sessions.some((session) => session.id === selectedSessionId)) {
      return selectedSessionId;
    }
    return sessions[0]?.id ?? null;
  }, [selectedSessionId, sessions]);
  const activeSession = sessions.find((session) => session.id === activeSessionId);
  const messagesQuery = useChatMessages(activeSessionId);
  const { sendMessage, isStreaming } = useSendChatMessage(activeSessionId);

  if (repositoryQuery.isLoading) {
    return (
      <main className="flex min-h-[60vh] flex-1 items-center justify-center gap-3 text-sm text-muted-foreground">
        <Spinner />
        Loading repository…
      </main>
    );
  }

  if (repositoryQuery.isError || !repository) {
    return (
      <ErrorPanel
        message={
          repositoryQuery.error instanceof Error
            ? repositoryQuery.error.message
            : "Repository details are unavailable."
        }
        onRetry={() => void repositoryQuery.refetch()}
      />
    );
  }

  if (indexStatusQuery.isError && repository.indexStatus !== "READY") {
    return (
      <ErrorPanel
        message={
          indexStatusQuery.error instanceof Error
            ? indexStatusQuery.error.message
            : "Could not check the repository indexing status."
        }
        onRetry={() => void indexStatusQuery.refetch()}
      />
    );
  }

  const visibleRepository: Repository = indexStatusQuery.data
    ? {
        ...repository,
        indexStatus: indexStatusQuery.data.indexStatus,
        filesTotal: indexStatusQuery.data.filesTotal,
        filesProcessed: indexStatusQuery.data.filesProcessed,
        chunkCount: indexStatusQuery.data.chunkCount,
        indexedAt: indexStatusQuery.data.indexedAt,
        errorMessage: indexStatusQuery.data.errorMessage,
      }
    : repository;

  const createNewChat = () => {
    createSession.mutate(
      { repositoryId: repoId },
      {
        onSuccess: (session) => {
          setSelectedSessionId(session.id);
          setMobileSidebarOpen(false);
        },
      }
    );
  };

  const sidebar = (
    <ChatSidebar
      repository={visibleRepository}
      sessions={sessions}
      selectedSessionId={activeSessionId}
      isLoading={sessionsQuery.isLoading}
      isCreating={createSession.isPending}
      onCreate={createNewChat}
      onSelect={(sessionId) => {
        setSelectedSessionId(sessionId);
        setMobileSidebarOpen(false);
      }}
      className="w-full border-r-0"
    />
  );

  if (visibleRepository.indexStatus !== "READY") {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Repositories
          </Link>
          <span className="truncate text-sm font-medium">{repository.fullName}</span>
        </header>
        <IndexingState repository={visibleRepository} />
      </div>
    );
  }

  return (
    <main className="flex h-dvh min-h-[520px] overflow-hidden bg-background">
      <div className="hidden md:flex">{sidebar}</div>
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-3 sm:px-5">
          <div className="md:hidden">
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
              <SheetTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Open chat history"
                  />
                }
              >
                <Menu aria-hidden="true" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0" showCloseButton>
                <SheetTitle className="sr-only">Chat history</SheetTitle>
                <SheetDescription className="sr-only">
                  Select a previous conversation or start a new one.
                </SheetDescription>
                {sidebar}
              </SheetContent>
            </Sheet>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">
              {activeSession?.title ?? repository.name}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {repository.fullName}
            </div>
          </div>
          <Link
            href="/dashboard"
            className="hidden items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Repositories
          </Link>
        </header>

        {sessionsQuery.isError ? (
          <ErrorPanel
            message={
              sessionsQuery.error instanceof Error
                ? sessionsQuery.error.message
                : "Could not load chat history."
            }
            onRetry={() => void sessionsQuery.refetch()}
          />
        ) : (
          <>
            {activeSessionId ? (
              <ChatMessages
                key={activeSessionId}
                messages={messagesQuery.data ?? []}
                repository={visibleRepository}
                isLoading={messagesQuery.isLoading}
                error={
                  messagesQuery.isError
                    ? messagesQuery.error instanceof Error
                      ? messagesQuery.error.message
                      : "Could not load messages."
                    : null
                }
                onRetry={() => void messagesQuery.refetch()}
                onSuggestedPrompt={sendMessage}
              />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl border bg-card text-primary">
                  <MessageSquarePlus className="size-6" aria-hidden="true" />
                </div>
                <h1 className="mt-4 text-lg font-semibold">Start a conversation</h1>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  Create a chat to ask questions about {repository.name} and get
                  answers with links to the relevant files.
                </p>
                <Button
                  type="button"
                  className="mt-5"
                  onClick={createNewChat}
                  disabled={createSession.isPending}
                >
                  <MessageSquarePlus aria-hidden="true" />
                  {createSession.isPending ? "Creating chat..." : "New chat"}
                </Button>
              </div>
            )}

            <ChatComposer
              onSend={sendMessage}
              disabled={!activeSessionId || messagesQuery.isError}
              isSending={isStreaming}
              placeholder={
                activeSession
                  ? `Ask a question about ${repository.name}...`
                  : "Create a chat before sending a message..."
              }
            />
          </>
        )}
      </section>
    </main>
  );
}
