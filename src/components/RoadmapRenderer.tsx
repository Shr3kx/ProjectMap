"use client";

import React, { useMemo } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Building2,
  Users,
  Brain,
  FileText,
  CheckCircle,
  Briefcase,
  Upload,
  MessagesSquare,
  Lightbulb,
  Globe,
  Linkedin,
  Search,
  FileSearch,
  UserCheck,
  Award,
  Settings,
  Target,
  MessageSquare,
  Zap,
  TrendingUp,
  BarChart3,
  FolderKanban,
  Map,
} from "lucide-react";
import { Handle, Position } from "@xyflow/react";

// Icon mapping
const iconMap: Record<string, React.ComponentType<any>> = {
  Building2,
  Users,
  Brain,
  FileText,
  CheckCircle,
  Briefcase,
  Upload,
  MessagesSquare,
  Lightbulb,
  Globe,
  Linkedin,
  Search,
  FileSearch,
  UserCheck,
  Award,
  Settings,
  Target,
  MessageSquare,
  Zap,
  TrendingUp,
  BarChart3,
  FolderKanban,
  Map,
};

// Custom Node Component
const EntityNode = ({ data }: { data: any }) => {
  // Icon can be either a string (from JSON) or a component (from processed nodes)
  const IconComponent = React.useMemo(() => {
    if (typeof data.icon === 'string') {
      return iconMap[data.icon] || Map;
    }
    return data.icon || Map;
  }, [data.icon]);
  const borderColor = data.color || "#34C759";
  const isSmall = data.size === "small";

  return (
    <div className="relative">
      <div
        className={`relative bg-white dark:bg-zinc-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${
          isSmall
            ? "min-w-[100px] max-w-[120px] sm:min-w-[120px] sm:max-w-[140px]"
            : "min-w-[150px] max-w-[170px] sm:min-w-[180px] sm:max-w-[200px]"
        }`}
        style={{
          border: `1px solid ${borderColor}30`,
        }}
      >
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: borderColor,
            width: 8,
            height: 8,
            border: "2px solid white",
          }}
        />

        <div className={isSmall ? "p-2 sm:p-2.5" : "p-2.5 sm:p-3"}>
          {isSmall ? (
            <div className="flex flex-col items-center gap-1 sm:gap-1.5">
              <div
                className="p-2 sm:p-2.5 rounded-lg"
                style={{ backgroundColor: `${borderColor}15` }}
              >
                <IconComponent
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  style={{ color: borderColor }}
                  strokeWidth={2}
                />
              </div>
              <h4
                className="font-semibold text-[10px] sm:text-[11px] text-center leading-tight"
                style={{ color: borderColor }}
              >
                {data.title}
              </h4>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                  <div
                    className="p-1 sm:p-1.5 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${borderColor}15` }}
                  >
                    <IconComponent
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      style={{ color: borderColor }}
                      strokeWidth={2}
                    />
                  </div>
                  <h4 className="font-semibold text-[10px] sm:text-xs text-zinc-900 dark:text-zinc-100 leading-tight truncate">
                    {data.title}
                  </h4>
                </div>
                {data.category && (
                  <span
                    className="px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-semibold rounded-full whitespace-nowrap flex-shrink-0"
                    style={{
                      backgroundColor: `${borderColor}20`,
                      color: borderColor,
                    }}
                  >
                    {data.category}
                  </span>
                )}
              </div>

              {data.attributes && data.attributes.length > 0 && (
                <div className="space-y-1.5 sm:space-y-2 mb-1.5 sm:mb-2 hidden sm:block">
                  {data.attributes.slice(0, 2).map((attr: any, i: number) => {
                    const AttrIcon = attr.icon ? iconMap[attr.icon] || Target : Target;
                    return (
                      <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                        <AttrIcon
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0"
                          style={{ color: `${borderColor}90` }}
                          strokeWidth={2}
                        />
                        <span className="text-[10px] sm:text-[11px] text-zinc-600 dark:text-zinc-400 leading-tight truncate">
                          {attr.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {data.moreCount && (
                <p className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 mt-1.5 sm:mt-2 hidden sm:block">
                  +{data.moreCount} More Attributes
                </p>
              )}
            </>
          )}
        </div>

        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: borderColor,
            width: 8,
            height: 8,
            border: "2px solid white",
          }}
        />
      </div>
    </div>
  );
};

const nodeTypes = {
  entityNode: EntityNode,
};

// Inner component that uses ReactFlow hooks
function RoadmapDiagramInner({ roadmapData }: { roadmapData: any }) {
  const { fitView } = useReactFlow();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Process nodes and edges from roadmap data
  const processedNodes = useMemo(() => {
    if (!roadmapData?.nodes) return [];
    return roadmapData.nodes.map((node: any) => {
      const IconComponent = node.data.icon ? iconMap[node.data.icon] || Map : Map;
      return {
        ...node,
        data: {
          ...node.data,
          icon: IconComponent,
        },
      };
    });
  }, [roadmapData]);

  const processedEdges = useMemo(() => {
    if (!roadmapData?.edges) return [];
    return roadmapData.edges.map((edge: any) => ({
      ...edge,
      markerEnd: edge.markerEnd || {
        type: MarkerType.ArrowClosed,
        color: edge.style?.stroke || "#06B6D4",
        width: 20,
        height: 20,
      },
    }));
  }, [roadmapData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(processedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(processedEdges);

  React.useEffect(() => {
    setNodes(processedNodes);
    setEdges(processedEdges);
  }, [processedNodes, processedEdges, setNodes, setEdges]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fitView({
        padding: isMobile ? 0.1 : 0.2,
        minZoom: isMobile ? 0.3 : 0.5,
        maxZoom: isMobile ? 1.2 : 1.5,
        duration: 300,
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [isMobile, fitView]);

  return (
    <div className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] relative my-4 rounded-lg overflow-hidden border border-border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        minZoom={isMobile ? 0.2 : 0.5}
        maxZoom={isMobile ? 2 : 1.5}
        defaultViewport={{ x: 0, y: 0, zoom: isMobile ? 0.6 : 0.85 }}
        proOptions={{ hideAttribution: true }}
        zoomOnScroll={!isMobile}
        panOnScroll={isMobile}
        preventScrolling={isMobile}
        panOnDrag={true}
        zoomOnDoubleClick={true}
        selectNodesOnDrag={false}
        className="touch-manipulation"
      />
    </div>
  );
}

// Main component with ReactFlowProvider
export function RoadmapRenderer({ roadmapData }: { roadmapData: any }) {
  if (!roadmapData || !roadmapData.nodes || roadmapData.nodes.length === 0) {
    return null;
  }

  return (
    <ReactFlowProvider>
      <RoadmapDiagramInner roadmapData={roadmapData} />
    </ReactFlowProvider>
  );
}

