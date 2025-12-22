"use client";

import React, { memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, Copy, RotateCw, Trash2 } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface MessageProps {
  message: {
    id: number;
    type: "assistant" | "user";
    content: string;
    timestamp: string;
    isLoading?: boolean;
    responseTime?: number;
  };
  isWelcome?: boolean;
  onCopy?: (content: string) => void;
  onRegenerate?: (messageId: number) => void;
  onDelete?: (messageId: number) => void;
}

const MessageComponent = memo(
  ({
    message,
    isWelcome = false,
    onCopy,
    onRegenerate,
    onDelete,
  }: MessageProps) => {
    const handleCopy = useCallback(() => {
      if (onCopy) {
        onCopy(message.content);
      } else {
        navigator.clipboard.writeText(message.content);
      }
    }, [message.content, onCopy]);

    const handleRegenerate = useCallback(() => {
      if (onRegenerate) {
        onRegenerate(message.id);
      }
    }, [message.id, onRegenerate]);

    const handleDelete = useCallback(() => {
      if (onDelete) {
        onDelete(message.id);
      }
    }, [message.id, onDelete]);

    const containerClassName = React.useMemo(
      () =>
        `flex ${
          message.type === "user"
            ? "justify-end"
            : isWelcome
              ? "justify-center"
              : "justify-start"
        }`,
      [message.type, isWelcome]
    );

    const messageClassName = React.useMemo(
      () =>
        `${message.type === "user" ? "max-w-[85%] sm:max-w-[80%] md:max-w-[75%]" : "w-full max-w-full sm:max-w-2xl"} ${
          message.type === "user" ? "order-2" : "order-1"
        } flex flex-col`,
      [message.type]
    );

    const cardClassName = React.useMemo(
      () =>
        `p-3 sm:p-4 ${
          message.type === "user"
            ? "bg-primary text-primary-foreground ml-2 sm:ml-4 rounded-2xl shadow-sm"
            : "bg-card shadow-sm rounded-2xl"
        }`,
      [message.type]
    );

    return (
      <div className={containerClassName}>
        <div className={messageClassName}>
          {message.type === "assistant" && !isWelcome && (
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Map className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-foreground">
                ProjectMap AI
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {message.timestamp}
              </span>
            </div>
          )}

          <Card className={cardClassName}>
            {message.type === "assistant" ? (
              <div className="text-sm sm:text-base">
                <MarkdownRenderer content={message.content} />
              </div>
            ) : (
              <p className="text-sm sm:text-base leading-relaxed text-primary-foreground break-words">
                {message.content}
              </p>
            )}
          </Card>

          {message.type === "assistant" && !isWelcome && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-1.5 sm:mt-2 gap-2 sm:gap-0">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
                <span>ProjectMap</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Responded in {message.responseTime || 0}s</span>
                <span className="hidden sm:inline">•</span>
                <span className="sm:hidden">{message.timestamp}</span>
                <span className="hidden sm:inline">{message.timestamp}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-accent touch-manipulation"
                  onClick={handleCopy}
                  aria-label="Copy message"
                >
                  <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
                {onRegenerate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-accent touch-manipulation"
                    onClick={handleRegenerate}
                    aria-label="Regenerate response"
                  >
                    <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-accent touch-manipulation"
                    onClick={handleDelete}
                    aria-label="Delete message"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {message.type === "user" && (
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {message.timestamp}
              </span>
              <span className="text-xs sm:text-sm font-medium text-foreground">You</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

MessageComponent.displayName = "MessageComponent";

export default MessageComponent;
