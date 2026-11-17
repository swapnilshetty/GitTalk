import { APIError, getAPIBaseUrl, type ChatMessage } from "@/lib/api";

type ChatStreamHandlers = {
  onUserMessage?: (message: ChatMessage) => void;
  onToken?: (token: string) => void;
  onAssistantMessage?: (message: ChatMessage) => void;
};

function parseMessage(data: string): ChatMessage {
  return JSON.parse(data) as ChatMessage;
}

function parseToken(data: string): string {
  try {
    const token: unknown = JSON.parse(data);
    return typeof token === "string" ? token : data;
  } catch {
    return data;
  }
}

function dispatchEvent(eventText: string, handlers: ChatStreamHandlers) {
  let eventName = "message";
  const data: string[] = [];

  for (const line of eventText.split(/\r?\n/)) {
    if (!line || line.startsWith(":")) continue;

    const separator = line.indexOf(":");
    const field = separator === -1 ? line : line.slice(0, separator);
    const value =
      separator === -1
        ? ""
        : line.slice(separator + 1).replace(/^ /, "");

    if (field === "event") {
      eventName = value;
    } else if (field === "data") {
      data.push(value);
    }
  }

  if (data.length === 0) return;

  const payload = data.join("\n");
  switch (eventName) {
    case "user_message":
      handlers.onUserMessage?.(parseMessage(payload));
      break;
    case "token":
      handlers.onToken?.(parseToken(payload));
      break;
    case "assistant_message":
      handlers.onAssistantMessage?.(parseMessage(payload));
      break;
    case "error":
      throw new Error(payload);
  }

  return eventName === "assistant_message";
}

async function getErrorMessage(response: Response) {
  const responseText = await response.text();
  if (!responseText) return response.statusText || "Request failed";

  try {
    const data: unknown = JSON.parse(responseText);
    if (typeof data === "object" && data !== null) {
      const errorData = data as { message?: unknown; error?: unknown };
      if (typeof errorData.message === "string") return errorData.message;
      if (typeof errorData.error === "string") return errorData.error;
    }
  } catch {
    return responseText;
  }

  return responseText;
}

export async function streamChatMessage(
  sessionId: string,
  content: string,
  handlers: ChatStreamHandlers,
  signal?: AbortSignal
) {
  const response = await fetch(
    `${getAPIBaseUrl()}/api/chat/sessions/${encodeURIComponent(sessionId)}/messages`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
      signal,
    }
  );

  if (!response.ok) {
    throw new APIError(response.status, await getErrorMessage(response));
  }

  if (!response.body) {
    throw new Error("The chat response did not include a readable stream.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let receivedAssistantMessage = false;

  const dispatch = (eventText: string) => {
    receivedAssistantMessage =
      dispatchEvent(eventText, handlers) || receivedAssistantMessage;
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });

      let boundary = buffer.match(/\r?\n\r?\n/);
      while (boundary?.index !== undefined) {
        const eventText = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary[0].length);
        dispatch(eventText);
        boundary = buffer.match(/\r?\n\r?\n/);
      }

      if (done) break;
    }

    if (buffer.trim()) dispatch(buffer);
  } finally {
    reader.releaseLock();
  }

  if (!receivedAssistantMessage) {
    throw new Error("The chat stream ended before the assistant response arrived.");
  }
}
