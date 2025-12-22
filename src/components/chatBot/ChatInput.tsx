"use client";

import React, { useState, useRef, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

const ChatInput = memo(
  ({
    onSendMessage,
    isLoading,
    placeholder = "Type your message...",
  }: ChatInputProps) => {
    const [message, setMessage] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        // Auto-resize textarea
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${Math.min(
            textareaRef.current.scrollHeight,
            200
          )}px`;
        }
      },
      []
    );

    const handleSendMessage = useCallback(() => {
      if (!message.trim() || isLoading) return;

      onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }, [message, isLoading, onSendMessage]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
      },
      [handleSendMessage]
    );

    const handleFileClick = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("File selected:", e.target.files?.[0]?.name);
      },
      []
    );

    return (
      <Card className="p-3 sm:p-4 bg-card border-border glass-card">
        <div className="flex gap-2 sm:gap-3 items-end">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 bg-transparent h-9 w-9 sm:h-10 sm:w-10 touch-manipulation"
            onClick={handleFileClick}
            aria-label="Attach file"
          >
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              placeholder={placeholder}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="min-h-[44px] max-h-[200px] resize-none border-input bg-background text-foreground placeholder:text-muted-foreground text-sm sm:text-base pr-12 sm:pr-14 py-3 sm:py-4"
              rows={1}
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8 sm:h-9 sm:w-9 bg-primary hover:bg-primary/90 text-primary-foreground touch-manipulation disabled:opacity-50"
              aria-label="Send message"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border">
          <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
            Press Enter to send, Shift + Enter for new line
          </p>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground ml-auto">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="hidden min-[475px]:inline">
              {isLoading
                ? "ProjectMap is typing..."
                : "ProjectMap Assistant Ready"}
            </span>
            <span className="min-[475px]:hidden">
              {isLoading ? "Typing..." : "Ready"}
            </span>
          </div>
        </div>
      </Card>
    );
  }
);

ChatInput.displayName = "ChatInput";

export default ChatInput;
