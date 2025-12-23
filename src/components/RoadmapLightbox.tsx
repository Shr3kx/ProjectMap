"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoadmapRenderer } from "./RoadmapRenderer";

interface RoadmapLightboxProps {
  roadmapData: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoadmapLightbox({
  roadmapData,
  open,
  onOpenChange,
}: RoadmapLightboxProps) {
  // Handle ESC key (Dialog already handles this, but we ensure it works)
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    if (open) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-[98vw] w-[98vw] h-[90vh] max-h-[90vh] p-0 sm:p-6 flex flex-col bg-background/95 backdrop-blur-md border-border/50 shadow-2xl"
        aria-label="Roadmap viewer"
        aria-describedby="roadmap-description"
      >
        <DialogHeader className="px-6 pt-6 pb-4 sm:px-0 sm:pt-0 flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            Project Roadmap
          </DialogTitle>
          <p id="roadmap-description" className="sr-only">
            Interactive roadmap diagram showing project phases and milestones.
            Use mouse or touch to pan and zoom.
          </p>
        </DialogHeader>
        <div className="flex-1 overflow-hidden px-6 pb-6 sm:px-0 sm:pb-0 min-h-0">
          <div className="w-full h-full">
            <RoadmapRenderer
              roadmapData={roadmapData}
              fullHeight={true}
              isLightbox={true}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
