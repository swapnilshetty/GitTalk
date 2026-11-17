"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";

import { api, type ChatMessage, type ChatSession } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { streamChatMessage } from "@/lib/stream-chat";
import { toast } from "@/components/ui/toast";

type CreateChatSessionInput = {
  repositoryId: string;
  title?: string;
};

type SendChatMessageInput = {
  content: string;
  optimisticUserId: string;
  optimisticAssistantId: string;
};

function replaceMessage(
  messages: ChatMessage[] | undefined,
  messageId: string,
  replacement: ChatMessage
) {
  return (messages ?? []).map((message) =>
    message.id === messageId ? replacement : message
  );
}

export function useChatSessions(repositoryId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.chat.sessions(repositoryId),
    queryFn: () => api.listSessions(repositoryId),
    enabled: Boolean(repositoryId) && enabled,
  });
}

export function useChatMessages(sessionId: string | null) {
  return useQuery({
    queryKey: queryKeys.chat.messages(sessionId ?? ""),
    queryFn: () => {
      if (!sessionId) {
        throw new Error("A chat session is required to load messages.");
      }

      return api.getMessages(sessionId);
    },
    enabled: Boolean(sessionId),
  });
}

export function useCreateChatSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ repositoryId, title }: CreateChatSessionInput) =>
      api.createSession(repositoryId, title),
    onSuccess: (session) => {
      queryClient.setQueryData<ChatSession[]>(
        queryKeys.chat.sessions(session.repositoryId),
        (sessions) =>
          sessions
            ? [
                session,
                ...sessions.filter((item) => item.id !== session.id),
              ]
            : [session]
      );
    },
    onError: (error: Error) => {
      toast.add({
        title: "Could not create chat",
        description: error.message,
        type: "error",
      });
    },
  });
}

export function useSendChatMessage(sessionId: string | null) {
  const queryClient = useQueryClient();
  const isSendingRef = useRef(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesQueryKey = queryKeys.chat.messages(sessionId ?? "");

  const mutation = useMutation({
    mutationFn: async ({
      content,
      optimisticUserId,
      optimisticAssistantId,
    }: SendChatMessageInput) => {
      if (!sessionId) {
        throw new Error("A chat session is required to send a message.");
      }

      setStreamingContent("");

      await streamChatMessage(sessionId, content, {
        onUserMessage: (message) => {
          queryClient.setQueryData<ChatMessage[]>(
            messagesQueryKey,
            (messages) => replaceMessage(messages, optimisticUserId, message)
          );
        },
        onToken: (token) => {
          setStreamingContent((current) => current + token);
          queryClient.setQueryData<ChatMessage[]>(
            messagesQueryKey,
            (messages) =>
              (messages ?? []).map((message) =>
                message.id === optimisticAssistantId
                  ? { ...message, content: message.content + token }
                  : message
              )
          );
        },
        onAssistantMessage: (message) => {
          queryClient.setQueryData<ChatMessage[]>(
            messagesQueryKey,
            (messages) =>
              replaceMessage(messages, optimisticAssistantId, message)
          );
        },
      });
    },
    onMutate: async ({
      content,
      optimisticUserId,
      optimisticAssistantId,
    }) => {
      await queryClient.cancelQueries({ queryKey: messagesQueryKey });

      const timestamp = new Date().toISOString();
      const optimisticMessages: ChatMessage[] = [
        {
          id: optimisticUserId,
          role: "USER",
          content,
          citations: [],
          createdAt: timestamp,
        },
        {
          id: optimisticAssistantId,
          role: "ASSISTANT",
          content: "",
          citations: [],
          createdAt: timestamp,
        },
      ];

      queryClient.setQueryData<ChatMessage[]>(
        messagesQueryKey,
        (messages) => [...(messages ?? []), ...optimisticMessages]
      );
    },
    onError: (error: Error) => {
      toast.add({
        title: "Could not send message",
        description: error.message,
        type: "error",
      });
    },
    onSettled: () => {
      isSendingRef.current = false;
      setStreamingContent("");
      void queryClient.invalidateQueries({ queryKey: messagesQueryKey });
    },
  });
  const mutate = mutation.mutate;

  const sendMessage = useCallback(
    (content: string) => {
      const trimmedContent = content.trim();
      if (!trimmedContent) return;

      if (!sessionId) {
        toast.add({
          title: "Could not send message",
          description: "Select a chat session first.",
          type: "error",
        });
        return;
      }

      if (isSendingRef.current) return;

      isSendingRef.current = true;
      mutate({
        content: trimmedContent,
        optimisticUserId: `optimistic-user-${crypto.randomUUID()}`,
        optimisticAssistantId: `optimistic-assistant-${crypto.randomUUID()}`,
      });
    },
    [mutate, sessionId]
  );

  return {
    sendMessage,
    isStreaming: mutation.isPending,
    streamingContent,
  };
}
