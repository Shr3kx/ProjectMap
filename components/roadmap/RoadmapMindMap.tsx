"use client";

import React, { useMemo, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  NodeProps,
  ReactFlowInstance,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import type { RoadmapNodeData, RoadmapNodeStatus } from "@/types/roadmap";
import { cn } from "@/lib/utils";

interface RoadmapMindMapProps {
  nodes: RoadmapNodeData[];
  showControls?: boolean;
  showLegend?: boolean;
  className?: string;
}

// Status-based colors
const statusColors: Record<RoadmapNodeStatus, { bg: string; border: string; text: string }> = {
  active: {
    bg: "#3B82F6",
    border: "#2563EB",
    text: "#FFFFFF",
  },
  completed: {
    bg: "#10B981",
    border: "#059669",
    text: "#FFFFFF",
  },
  pending: {
    bg: "#F59E0B",
    border: "#D97706",
    text: "#FFFFFF",
  },
  idea: {
    bg: "#8B5CF6",
    border: "#7C3AED",
    text: "#FFFFFF",
  },
};

// Custom Roadmap Node Component
const RoadmapNode = ({ data, selected }: NodeProps<{ label: string; status: RoadmapNodeStatus; description?: string; depth: number; children?: string[] }>) => {
  const colors = statusColors[data.status];
  const isRoot = data.depth === 0;

  return (
    <div
      style={{
        background: colors.bg,
        color: colors.text,
        padding: isRoot ? "16px 24px" : "12px 20px",
        borderRadius: "8px",
        border: `2px solid ${colors.border}`,
        fontSize: isRoot ? "16px" : "14px",
        fontWeight: isRoot ? "700" : "600",
        minWidth: isRoot ? "200px" : "160px",
        textAlign: "center",
        cursor: "pointer",
        boxShadow: selected
          ? `0 4px 12px ${colors.border}40`
          : "0 2px 4px rgba(0,0,0,0.1)",
        transition: "all 0.2s ease",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 4px 12px ${colors.border}60`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = selected
          ? `0 4px 12px ${colors.border}40`
          : "0 2px 4px rgba(0,0,0,0.1)";
      }}
    >
      {!isRoot && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: colors.border, width: "8px", height: "8px" }}
        />
      )}
      <div>{data.label}</div>
      {data.description && (
        <div
          style={{
            fontSize: "12px",
            opacity: 0.9,
            marginTop: "4px",
            fontWeight: "400",
          }}
        >
          {data.description}
        </div>
      )}
      {data.children && data.children.length > 0 && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: colors.border, width: "8px", height: "8px" }}
        />
      )}
    </div>
  );
};

const nodeTypes = {
  roadmap: RoadmapNode,
};

export function RoadmapMindMap({
  nodes: roadmapNodes,
  showControls = true,
  showLegend = false,
  className,
}: RoadmapMindMapProps) {
  const [reactFlowNodes, setReactFlowNodes, onNodesChange] = useNodesState([]);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Convert RoadmapNodeData to ReactFlow nodes and edges
  const { flowNodes, flowEdges } = useMemo(() => {
    if (!roadmapNodes || roadmapNodes.length === 0) {
      return { flowNodes: [], flowEdges: [] };
    }

    const nodes: Node[] = roadmapNodes.map(node => ({
      id: node.id,
      type: "roadmap",
      position: { x: node.x, y: node.y },
      data: {
        label: node.title,
        status: node.status,
        description: node.description,
        depth: node.depth,
        children: node.children,
      },
    }));

    const edges: Edge[] = [];
    roadmapNodes.forEach(node => {
      if (node.parentId) {
        edges.push({
          id: `e-${node.parentId}-${node.id}`,
          source: node.parentId,
          target: node.id,
          type: "smoothstep",
          animated: false,
          style: {
            stroke: "#6B7280",
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#6B7280",
            width: 20,
            height: 20,
          },
        });
      }
    });

    return { flowNodes: nodes, flowEdges: edges };
  }, [roadmapNodes]);

  React.useEffect(() => {
    setReactFlowNodes(flowNodes);
    setReactFlowEdges(flowEdges);
  }, [flowNodes, flowEdges, setReactFlowNodes, setReactFlowEdges]);

  // Fit view after nodes are loaded
  useEffect(() => {
    if (reactFlowInstance.current && flowNodes.length > 0) {
      setTimeout(() => {
        reactFlowInstance.current?.fitView({ padding: 0.3, duration: 400 });
      }, 100);
    }
  }, [flowNodes.length]);

  if (!roadmapNodes || roadmapNodes.length === 0) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center", className)}>
        <p className="text-muted-foreground">No roadmap data available</p>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className={cn("w-full h-full relative", className)} style={{ width: "100%", height: "100%", minHeight: "400px" }}>
        <ReactFlow
          nodes={reactFlowNodes}
          edges={reactFlowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={(instance) => {
            reactFlowInstance.current = instance;
          }}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: false,
          }}
          connectionLineStyle={{ stroke: "#6B7280", strokeWidth: 2 }}
          snapToGrid={true}
          snapGrid={[20, 20]}
          style={{ width: "100%", height: "100%" }}
        >
          <Background color="#e5e7eb" gap={20} size={1} />
          {showControls && <Controls showInteractive={false} />}
        </ReactFlow>
        {showLegend && (
          <div className="absolute bottom-4 left-4 bg-card border border-border rounded-lg p-4 shadow-lg z-10">
            <div className="text-sm font-semibold mb-2">Status Legend</div>
            <div className="flex flex-col gap-2">
              {Object.entries(statusColors).map(([status, colors]) => (
                <div key={status} className="flex items-center gap-2">
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      backgroundColor: colors.bg,
                      border: `2px solid ${colors.border}`,
                      borderRadius: "4px",
                    }}
                  />
                  <span className="text-xs capitalize">{status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ReactFlowProvider>
  );
}
