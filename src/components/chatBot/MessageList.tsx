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
  isAiThinking?: boolean;
  onCopy?: (content: string) => void;
  onRegenerate?: (messageId: number) => void;
  onDelete?: (messageId: number) => void;
}

const MessageList = memo(
  ({
    messages,
    isLoadingChat = false,
    isAiThinking = false,
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

    return (
      <div className="space-y-6 mb-8">
        {renderedMessages}
        {isAiThinking && (
          <div className="flex justify-start">
            <div className="w-full max-w-2xl flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-foreground">ProjectMap AI</span>
                <span className="text-xs text-muted-foreground">
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
              <div className="bg-card shadow-sm rounded-2xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                  <span>ProjectMap is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

MessageList.displayName = "MessageList";

export default MessageList;
