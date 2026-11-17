"use client";

import { Suspense, use } from "react";

import ChatView from "@/components/chat/chat-view";
import { RequireAuth } from "@/components/providers/require-auth";
import { Spinner } from "@/components/ui/spinner";

function ChatPageContent({
  params,
}: {
  params: Promise<{ repoid: string }>;
}) {
  const { repoid } = use(params);

  return (
    <RequireAuth>
      <ChatView repoId={repoid} />
    </RequireAuth>
  );
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ repoid: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Spinner className="size-6" />
          <span className="sr-only">Loading chat…</span>
        </div>
      }
    >
      <ChatPageContent params={params} />
    </Suspense>
  );
}