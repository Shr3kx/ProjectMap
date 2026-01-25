"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { motion, useMotionValue, PanInfo } from "framer-motion";
import type { RoadmapNodeData } from "@/types/roadmap";

const STATUS_COLORS: Record<RoadmapNodeData["status"], string> = {
  active: "bg-primary/20 border-primary/50 text-primary",
  completed: "bg-green-500/20 border-green-500/50 text-green-600 dark:text-green-400",
  pending: "bg-yellow-500/20 border-yellow-500/50 text-yellow-600 dark:text-yellow-400",
  idea: "bg-accent/20 border-accent/50 text-accent-foreground",
};

// Helper to extract dot color class from status colors
const getStatusDotColor = (status: RoadmapNodeData["status"]): string => {
  const colors = STATUS_COLORS[status].split(" ");
  // Extract text color (usually the last class)
  const textColor = colors.find(cls => cls.startsWith("text-"));
  if (textColor) {
    // Convert text color to background color for the dot
    return textColor.replace("text-", "bg-");
  }
  // Fallback to primary
  return "bg-primary";
};

const MindMapNode: React.FC<{
  node: RoadmapNodeData;
  onDrag: (id: string, x: number, y: number) => void;
  scale: number;
}> = ({ node, onDrag, scale }) => {
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(node.x);
  const y = useMotionValue(node.y);

  useEffect(() => {
    x.set(node.x);
    y.set(node.y);
  }, [node.x, node.y, x, y]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const newX = node.x + info.offset.x / scale;
    const newY = node.y + info.offset.y / scale;
    onDrag(node.id, newX, newY);
    setIsDragging(false);
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{
        x,
        y,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      className="absolute"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className={`
          relative bg-card rounded-xl shadow-lg border-2 border-border
          ${isDragging ? "shadow-2xl" : "shadow-md"}
          transition-shadow duration-200
          ${node.depth === 0 ? "w-64" : "w-56"}
        `}
      >
        <div className={`p-4 ${node.depth === 0 ? "pb-3" : "pb-3"}`}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className={`font-semibold ${node.depth === 0 ? "text-lg" : "text-base"} text-card-foreground leading-tight`}
            >
              {node.title}
            </h3>
            <div className="flex-shrink-0 mt-0.5">
              <div
                className={`w-2 h-2 rounded-full ${getStatusDotColor(node.status)}`}
              />
            </div>
          </div>
          {node.description && (
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              {node.description}
            </p>
          )}
          <div
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[node.status]}`}
          >
            {node.status}
          </div>
        </div>
        {node.depth === 0 && (
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl -z-10 blur-sm" />
        )}
      </div>
    </motion.div>
  );
};

const ConnectionLines: React.FC<{
  nodes: RoadmapNodeData[];
  scale: number;
  offsetX: number;
  offsetY: number;
  centerX: number;
  centerY: number;
}> = ({ nodes, scale, offsetX, offsetY, centerX, centerY }) => {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    >
      {nodes
        .filter((n) => n.parentId)
        .map((node) => {
          const parent = nodeMap.get(node.parentId!);
          if (!parent) return null;

          const x1 = parent.x * scale + offsetX + centerX;
          const y1 = parent.y * scale + offsetY + centerY;
          const x2 = node.x * scale + offsetX + centerX;
          const y2 = node.y * scale + offsetY + centerY;

          const midX = (x1 + x2) / 2;
          const controlOffset = Math.abs(x2 - x1) * 0.3;

          return (
            <motion.path
              key={`${parent.id}-${node.id}`}
              d={`M ${x1} ${y1} Q ${midX} ${y1 + controlOffset}, ${x2} ${y2}`}
              stroke="hsl(var(--border))"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: node.depth * 0.1 }}
            />
          );
        })}
    </svg>
  );
};

export interface RoadmapMindMapProps {
  nodes: RoadmapNodeData[];
  className?: string;
  showControls?: boolean;
  showLegend?: boolean;
}

export function RoadmapMindMap({
  nodes: initialNodes,
  className = "",
  showControls = true,
  showLegend = true,
}: RoadmapMindMapProps) {
  const [nodes, setNodes] = useState<RoadmapNodeData[]>(initialNodes);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => {
      if (el) {
        const { width, height } = el.getBoundingClientRect();
        setSize({ width, height });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  const handleNodeDrag = (id: string, x: number, y: number) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x, y } : n)),
    );
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.5, scale + delta), 2);
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsPanning(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleReset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setNodes(initialNodes);
  };

  const centerX = size.width / 2;
  const centerY = size.height / 2;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[400px] overflow-hidden bg-background ${className}`}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border) / 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: "center",
        }}
      />

      {showControls && (
        <>
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg border border-border p-3">
              <div className="text-xs font-medium text-foreground mb-2">
                Controls
              </div>
              <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                <div>• Drag nodes to move</div>
                <div>• Scroll to zoom</div>
                <div>• Drag canvas to pan</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-card transition-colors"
            >
              Reset View
            </button>
          </div>
          <div className="absolute top-4 right-4 z-20 bg-card/90 backdrop-blur-sm rounded-xl shadow-lg border border-border px-4 py-2">
            <div className="text-xs font-medium text-foreground">
              Zoom: {Math.round(scale * 100)}%
            </div>
          </div>
        </>
      )}

      <div
        className="absolute inset-0 cursor-move"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "center",
          }}
        >
          <ConnectionLines
            nodes={nodes}
            scale={scale}
            offsetX={offset.x}
            offsetY={offset.y}
            centerX={centerX}
            centerY={centerY}
          />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {nodes.map((node) => (
              <MindMapNode
                key={node.id}
                node={node}
                onDrag={handleNodeDrag}
                scale={scale}
              />
            ))}
          </div>
        </div>
      </div>

      {showLegend && (
        <div className="absolute bottom-4 left-4 z-20 bg-card/90 backdrop-blur-sm rounded-xl shadow-lg border border-border p-3">
          <div className="text-xs font-medium text-foreground mb-2">
            Status
          </div>
          <div className="flex flex-col gap-1.5">
            {(Object.entries(STATUS_COLORS) as [RoadmapNodeData["status"], string][]).map(
              ([status, cls]) => (
                <div key={status} className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusDotColor(status)}`}
                  />
                  <span className="text-xs text-muted-foreground capitalize">
                    {status}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
