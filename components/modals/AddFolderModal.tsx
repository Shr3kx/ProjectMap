"use client";

import * as React from "react";
import { Folder } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFolderCreated: (folder: { id: string; name: string }) => void;
}

export function AddFolderModal({
  open,
  onOpenChange,
  onFolderCreated,
}: AddFolderModalProps) {
  const [name, setName] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    } else {
      setName("");
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmed }),
      });

      if (!res.ok) {
        console.error("Failed to create folder:", await res.text());
        return;
      }

      const data = await res.json();
      const folder = data?.folder as { id: string; name: string } | undefined;
      if (folder) {
        onFolderCreated(folder);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error creating folder:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-card border-border rounded-2xl shadow-2xl gap-4">
        <DialogHeader className="flex flex-row items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Folder className="size-5" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-base font-semibold">
              Create folder
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Organize your chats by creating a new folder.
            </DialogDescription>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="folder-name"
              className="text-sm font-medium text-foreground"
            >
              Folder name
            </label>
            <Input
              id="folder-name"
              ref={inputRef}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Work, Ideas, Learning"
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter className="flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? "Creating…" : "Create folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

