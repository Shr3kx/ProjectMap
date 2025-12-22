"use client";

import React, { useState } from "react";
import { Message } from "@/types/chat";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { User, Map, Copy, Edit, RefreshCw, FileDown } from "lucide-react";
import toast from "react-hot-toast";

interface MessageBubbleProps {
  message: Message;
  modelName?: string;
  timeTaken?: number;
  onEdit?: (messageId: string, content: string) => void;
  onRegenerate?: (messageId: string) => void;
  onExportPDF?: (messageId: string) => void;
}

export function MessageBubble({
  message,
  modelName,
  timeTaken,
  onEdit,
  onRegenerate,
  onExportPDF,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      toast.success("Copied to clipboard!");
    }
  };

  const handleEdit = () => {
    if (onEdit && message.content) {
      onEdit(message.id, message.content);
    }
  };

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate(message.id);
    }
  };

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF(message.id);
    }
  };

  return (
    <div
      className={`flex gap-2 sm:gap-3 mb-3 sm:mb-4 ${isUser ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-secondary/50 text-secondary-foreground order-2"
            : "bg-primary/10 text-primary order-1"
        }`}
      >
        {isUser ? (
          <User size={16} className="sm:w-[18px] sm:h-[18px]" />
        ) : (
          <Map size={16} className="sm:w-[18px] sm:h-[18px]" />
        )}
      </div>

      <div
        className={`max-w-[85%] sm:max-w-[80%] ${isUser ? "order-1" : "order-2"} relative`}
      >
        <div
          className={`rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
            isUser
              ? "bg-secondary/30 text-secondary-foreground border border-border/50"
              : "bg-secondary/40 border border-border text-card-foreground shadow-md"
          }`}
        >
          {/* Attachments Preview */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-3 space-y-2">
              {message.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-muted rounded-lg text-sm"
                >
                  {attachment.type === "image" ? (
                    <div className="w-full">
                      <img
                        src={attachment.preview || attachment.data}
                        alt={attachment.name}
                        className="max-w-full h-auto rounded-md max-h-64 object-contain"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {attachment.name}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center flex-shrink-0">
                        📄
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-foreground">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Text Content */}
          {message.content && (
            <div className="text-sm sm:text-base">
              {isUser ? (
                <p className="whitespace-pre-wrap break-words leading-relaxed">
                  {message.content}
                </p>
              ) : (
                <MarkdownRenderer content={message.content} />
              )}
            </div>
          )}
        </div>

        {/* Action Buttons - Show on hover */}
        {isHovered && (
          <div
            className={`absolute -bottom-2 sm:-bottom-3 flex items-center gap-0.5 sm:gap-1 ${
              isUser ? "left-3 sm:left-4" : "right-3 sm:right-4"
            }`}
          >
            {/* Copy Button - Available for all messages */}
            <button
              onClick={handleCopy}
              className="p-1 sm:p-1.5 rounded-md bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Copy message"
            >
              <Copy size={12} className="sm:w-3.5 sm:h-3.5" />
            </button>

            {/* Edit Button - Only for user messages */}
            {isUser && onEdit && (
              <button
                onClick={handleEdit}
                className="p-1 sm:p-1.5 rounded-md bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Edit message"
              >
                <Edit size={12} className="sm:w-3.5 sm:h-3.5" />
              </button>
            )}

            {/* Regenerate Button - Only for AI messages */}
            {!isUser && onRegenerate && (
              <button
                onClick={handleRegenerate}
                className="p-1 sm:p-1.5 rounded-md bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Regenerate response"
              >
                <RefreshCw size={12} className="sm:w-3.5 sm:h-3.5" />
              </button>
            )}

            {/* Export to PDF Button - Only for AI messages */}
            {!isUser && onExportPDF && (
              <button
                onClick={handleExportPDF}
                className="p-1 sm:p-1.5 rounded-md bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Export to PDF"
              >
                <FileDown size={12} className="sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Timestamp and Metadata */}
        <div
          className={`text-[10px] sm:text-xs text-muted-foreground/40 mt-1 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          {!isUser && modelName && (
            <>
              <span className="font-medium">{modelName}</span>
              <span>•</span>
            </>
          )}
          {!isUser && timeTaken && (
            <>
              <span>Responsed in {(timeTaken / 1000).toFixed(1)}s</span>
              <span>•</span>
            </>
          )}
          <span>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
