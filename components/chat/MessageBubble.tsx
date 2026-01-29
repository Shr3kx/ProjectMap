"use client";

import React, { useState } from "react";
import { Message } from "@/types/chat";
import { MarkdownRenderer } from "@/utils/markdownRenderer";
import {
  User,
  Sparkles,
  Copy,
  Edit,
  RefreshCw,
  FileDown,
  Map,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RoadmapModal } from "@/components/modals/RoadmapModal";

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
  const [roadmapModalOpen, setRoadmapModalOpen] = useState(false);
  const hasRoadmap = !isUser && message.roadmapData && message.roadmapData.length > 0;

  // Additional safety check: if roadmap data exists but content contains roadmap-json block,
  // remove it to prevent double display of roadmap
  const cleanContent = React.useMemo(() => {
    if (!message.content || !hasRoadmap) return message.content;
    
    // Remove any remaining roadmap-json code blocks to prevent display issues
    return message.content
      .replace(/```\s*roadmap-json[\s\S]*?```/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }, [message.content, hasRoadmap]);

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
      className={`flex gap-3 mb-4 ${isUser ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-secondary/50 text-secondary-foreground order-2"
            : "bg-primary/10 text-primary order-1"
        }`}
      >
        {isUser ? <User size={18} /> : <Sparkles size={18} />}
      </div>

      <div className={`max-w-[80%] ${isUser ? "order-1" : "order-2"} relative`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
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
          {cleanContent && (
            <div className="text-sm">
              {isUser ? (
                <p className="whitespace-pre-wrap break-words">
                  {cleanContent}
                </p>
              ) : (
                <MarkdownRenderer content={cleanContent} />
              )}
            </div>
          )}

          {/* View Roadmap button when roadmap data is present */}
          {hasRoadmap && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setRoadmapModalOpen(true)}
              >
                <Map className="size-4" />
                View Roadmap
              </Button>
            </div>
          )}
        </div>

        {hasRoadmap && (
          <RoadmapModal
            open={roadmapModalOpen}
            onOpenChange={setRoadmapModalOpen}
            nodes={message.roadmapData!}
          />
        )}

        {/* Action Buttons - Show on hover */}
        {isHovered && (
          <div
            className={`absolute -bottom-3 flex items-center gap-1 ${
              isUser ? "left-4" : "right-4"
            }`}
          >
            {/* Copy Button - Available for all messages */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Copy message"
            >
              <Copy size={14} />
            </button>

            {/* Edit Button - Only for user messages */}
            {isUser && onEdit && (
              <button
                onClick={handleEdit}
                className="p-1.5 rounded-md bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Edit message"
              >
                <Edit size={14} />
              </button>
            )}

            {/* Regenerate Button - Only for AI messages */}
            {!isUser && onRegenerate && (
              <button
                onClick={handleRegenerate}
                className="p-1.5 rounded-md bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Regenerate response"
              >
                <RefreshCw size={14} />
              </button>
            )}

            {/* Export to PDF Button - Only for AI messages */}
            {!isUser && onExportPDF && (
              <button
                onClick={handleExportPDF}
                className="p-1.5 rounded-md bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Export to PDF"
              >
                <FileDown size={14} />
              </button>
            )}
          </div>
        )}

        {/* Timestamp and Metadata */}
        <div
          className={`text-xs text-muted-foreground/40 mt-1 px-4 flex items-center gap-2 ${
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
              <span>Responded in {(timeTaken / 1000).toFixed(1)}s</span>
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
