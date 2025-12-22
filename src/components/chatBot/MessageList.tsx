"use client";

import React, { memo, useMemo, useEffect, useRef } from "react";
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages, isAiThinking]);

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
        <div className="flex items-center justify-center py-12 sm:py-16">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm sm:text-base">Loading conversation...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-8">
        {renderedMessages}
        {isAiThinking && (
          <div className="flex justify-start">
            <div className="w-full max-w-full sm:max-w-2xl flex flex-col">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground">ProjectMap AI</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
              <div className="bg-card shadow-sm rounded-2xl p-3 sm:p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs sm:text-sm">ProjectMap is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    );
  }
);

MessageList.displayName = "MessageList";

export default MessageList;
