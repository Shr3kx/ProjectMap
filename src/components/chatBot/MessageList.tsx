"use client";

import React, { memo, useMemo } from "react";
import MessageComponent from "./MessageComponent";

interface Message {
  id: number;
  type: "assistant" | "user";
  content: string;
  timestamp: string;
  isLoading?: boolean;
  responseTime?: number;
}

interface MessageListProps {
  messages: Message[];
  isLoadingChat?: boolean;
  onCopy?: (content: string) => void;
  onRegenerate?: (messageId: number) => void;
  onDelete?: (messageId: number) => void;
}

const MessageList = memo(
  ({
    messages,
    isLoadingChat = false,
    onCopy,
    onRegenerate,
    onDelete,
  }: MessageListProps) => {
    // Memoize the rendered messages to prevent re-rendering when parent re-renders
    const renderedMessages = useMemo(() => {
      return messages.map((message, index) => {
        const isWelcome = index === 0 && message.type === "assistant";

        return (
          <MessageComponent
            key={message.id}
            message={message}
            isWelcome={isWelcome}
            onCopy={onCopy}
            onRegenerate={onRegenerate}
            onDelete={onDelete}
          />
        );
      });
    }, [messages, onCopy, onRegenerate, onDelete]);

    if (isLoadingChat) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Loading conversation...</span>
          </div>
        </div>
      );
    }

    return <div className="space-y-6 mb-8">{renderedMessages}</div>;
  }
);

MessageList.displayName = "MessageList";

export default MessageList;
