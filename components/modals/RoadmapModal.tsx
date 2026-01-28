"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoadmapMindMap } from "@/components/roadmap/RoadmapMindMap";
import type { RoadmapNodeData } from "@/types/roadmap";

interface RoadmapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: RoadmapNodeData[];
}

export function RoadmapModal({
  open,
  onOpenChange,
  nodes,
}: RoadmapModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] w-full max-h-[90vh] h-[85vh] sm:max-w-6xl gap-0 p-0 overflow-hidden flex flex-col bg-card border-border"
        aria-describedby={undefined}
      >
        <DialogHeader className="shrink-0 px-6 pt-6 pb-2 border-b border-border">
          <DialogTitle className="text-lg font-semibold">
            Project Roadmap
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 relative px-2 pb-2 overflow-hidden">
          <RoadmapMindMap
            key={`roadmap-${nodes.length}-${open}`}
            nodes={nodes}
            showControls
            showLegend
            className="w-full h-full rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
