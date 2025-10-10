"use client";

import React, { useState, useRef, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
      },
      []
    );

    const handleSendMessage = useCallback(() => {
      if (!message.trim() || isLoading) return;

      onSendMessage(message.trim());
      setMessage("");
    }, [message, isLoading, onSendMessage]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
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
      <Card className="p-4 bg-card border-border glass-card sticky bottom-4">
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 bg-transparent"
            onClick={handleFileClick}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <Input
              ref={inputRef}
              placeholder={placeholder}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="border-input bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Press Enter to send, Shift + Enter for new line
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            {isLoading
              ? "ProjectMap is typing..."
              : "ProjectMap Assistant Ready"}
          </div>
        </div>
      </Card>
    );
  }
);

ChatInput.displayName = "ChatInput";

export default ChatInput;
