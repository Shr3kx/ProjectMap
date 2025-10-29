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
        `${message.type === "user" ? "max-w-[80%]" : "w-full max-w-2xl"} ${
          message.type === "user" ? "order-2" : "order-1"
        } flex flex-col`,
      [message.type]
    );

    const cardClassName = React.useMemo(
      () =>
        `p-4 ${
          message.type === "user"
            ? "bg-primary text-red ml-4 rounded-2xl shadow-sm"
            : "bg-card shadow-sm rounded-2xl"
        }`,
      [message.type]
    );

    return (
      <div className={containerClassName}>
        <div className={messageClassName}>
          {message.type === "assistant" && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Map className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">
                ProjectMap AI
              </span>
              <span className="text-xs text-muted-foreground">
                {message.timestamp}
              </span>
            </div>
          )}

          <Card className={cardClassName}>
            {message.type === "assistant" ? (
              <MarkdownRenderer content={message.content} />
            ) : (
              <p className="text-sm leading-relaxed text-primary-foreground">
                {message.content}
              </p>
            )}
          </Card>

          {message.type === "assistant" && !isWelcome && (
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>ProjectMap</span>
                <span>•</span>
                <span>Responded in {message.responseTime || 0}s</span>
                <span>•</span>
                <span>{message.timestamp}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-accent"
                  onClick={handleCopy}
                >
                  <Copy className="w-3 h-3" />
                </Button>
                {onRegenerate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-accent"
                    onClick={handleRegenerate}
                  >
                    <RotateCw className="w-3 h-3" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-accent"
                    onClick={handleDelete}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {message.type === "user" && (
            <div className="flex items-center justify-end gap-2 mt-2">
              <span className="text-xs text-muted-foreground">
                {message.timestamp}
              </span>
              <span className="text-sm font-medium text-foreground">You</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

MessageComponent.displayName = "MessageComponent";

export default MessageComponent;
