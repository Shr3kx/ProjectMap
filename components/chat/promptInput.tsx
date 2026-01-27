"use client";

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";
import type React from "react";
import { useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUp02Icon,
  Attachment,
  Earth,
  Mic,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { ChatAttachment } from "./chatContainer";

type CombinedPromptInputProps = {
  value: string;
  isLoading?: boolean;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  attachments?: ChatAttachment[];
  onRemoveAttachment?: (id: string) => void;
  onFilesSelected?: (files: File[]) => void;
  searchEnabled?: boolean;
  onToggleSearch?: () => void;
  position?: "center" | "bottom";
};

function CombinedPromptInput({
  value,
  isLoading = false,
  onValueChange,
  onSubmit,
  attachments = [],
  onRemoveAttachment,
  onFilesSelected,
  searchEnabled = false,
  onToggleSearch,
  position = "bottom",
}: CombinedPromptInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!value.trim() && attachments.length === 0) return;
    onSubmit();
  };

  return (
    <div className="absolute inset-x-0 mx-auto max-w-3xl px-3 md:px-5 bottom-0 pb-4 md:pb-0">
      <div className="border-border/50 bg-input/50 border border-b-0 p-1.5 pb-0 rounded-4xl rounded-b-none backdrop-blur-sm">
        <PromptInput
          isLoading={isLoading}
          value={value}
          onValueChange={onValueChange}
          onSubmit={handleSubmit}
          className="border-input bg-popover/50 relative z-10 w-full rounded-3xl rounded-b-none border border-b-0 p-0 pt-1 shadow-xs"
        >
          <div className="flex flex-col">
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 px-3 pt-2">
                {attachments.map(attachment => (
                  <div
                    key={attachment.id}
                    className="bg-muted/70 text-muted-foreground flex items-center gap-2 rounded-full px-3 py-1 text-xs"
                  >
                    <span className="max-w-40 truncate">{attachment.name}</span>
                    <button
                      className="text-foreground/70 hover:text-foreground"
                      onClick={() => onRemoveAttachment?.(attachment.id)}
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <PromptInputTextarea
              placeholder="Ask anything..."
              className="min-h-16 pt-3 pl-4 pr-4 text-base leading-[1.3] sm:text-base md:text-base"
            />

            <PromptInputActions className="mt-4 flex w-full items-center justify-between gap-2 px-3 pb-5">
              <div className="flex items-center gap-2">
                <PromptInputAction tooltip="Add attachment / action">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    <HugeiconsIcon
                      icon={Attachment}
                      strokeWidth={2}
                      className="rotate-45"
                    />
                  </Button>
                </PromptInputAction>

                <PromptInputAction tooltip="Web search">
                  <Button
                    variant={searchEnabled ? "default" : "outline"}
                    className="rounded-full px-3"
                    onClick={onToggleSearch}
                    type="button"
                  >
                    <HugeiconsIcon icon={Earth} strokeWidth={2} />
                    Search
                  </Button>
                </PromptInputAction>
              </div>

              <div className="flex items-center gap-2">
                <PromptInputAction tooltip="Voice input">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-full hover:text-white"
                    type="button"
                  >
                    <HugeiconsIcon icon={Mic} strokeWidth={2} />
                  </Button>
                </PromptInputAction>

                <Button
                  size="icon"
                  disabled={
                    (!value.trim() && attachments.length === 0) || isLoading
                  }
                  onClick={handleSubmit}
                  className="size-9 hover:brightness-110"
                >
                  {!isLoading ? (
                    <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={2} />
                  ) : (
                    <div className="size-3.5 animate-pulse rounded-full bg-white/80" />
                  )}
                </Button>
              </div>
            </PromptInputActions>
          </div>
        </PromptInput>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={event => {
          if (!event.target.files) return;
          onFilesSelected?.(Array.from(event.target.files));
          event.target.value = "";
        }}
      />
    </div>
  );
}

export { CombinedPromptInput };
