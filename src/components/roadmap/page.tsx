"use client";

import React, {
  useCallback,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Handle,
  Position,
  ReactFlowProvider,
  useReactFlow,
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
  Briefcase as BriefcaseAlt,
  FileSearch,
  UserCheck,
  Award,
  Settings,
  Target,
  MessageSquare,
  Zap,
  TrendingUp,
  BarChart3,
} from "lucide-react";

// Custom styles for the workflow
const customStyles = `
  .react-flow__edge-path {
    stroke-width: 2.5;
  }
  @media (max-width: 640px) {
    .react-flow__edge-path {
      stroke-width: 2;
    }
  }
  .react-flow__edge-text {
    font-size: 12px;
    font-weight: 600;
    fill: #52525b;
  }
  @media (max-width: 640px) {
    .react-flow__edge-text {
      font-size: 10px;
    }
  }
  .dark .react-flow__edge-text {
    fill: #a1a1aa;
  }
  .react-flow__edge-textbg {
    fill: white;
    fill-opacity: 0.95;
  }
  .dark .react-flow__edge-textbg {
    fill: #18181b;
    fill-opacity: 0.95;
  }
  .react-flow__node {
    cursor: grab;
  }
  .react-flow__node:active {
    cursor: grabbing;
  }
  .react-flow__controls {
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  }
  @media (max-width: 640px) {
    .react-flow__controls {
      transform: scale(0.85);
    }
  }
  .react-flow__controls-button {
    width: 32px;
    height: 32px;
  }
  @media (max-width: 640px) {
    .react-flow__controls-button {
      width: 28px;
      height: 28px;
    }
  }
`;

// Custom Node Component with cleaner design
const EntityNode = ({ data }: { data: any }) => {
  const Icon = data.icon;
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
        {/* Handles - only left and right */}
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
            // Small icon-only card
            <div className="flex flex-col items-center gap-1 sm:gap-1.5">
              <div
                className="p-2 sm:p-2.5 rounded-lg"
                style={{ backgroundColor: `${borderColor}15` }}
              >
                <Icon
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
            // Regular card with icon, title, pill, and attributes
            <>
              {/* Header with icon, title, and pill */}
              <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                  <div
                    className="p-1 sm:p-1.5 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${borderColor}15` }}
                  >
                    <Icon
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

              {/* Attributes with icons - hidden on very small screens */}
              {data.attributes && data.attributes.length > 0 && (
                <div className="space-y-1.5 sm:space-y-2 mb-1.5 sm:mb-2 hidden sm:block">
                  {data.attributes.slice(0, 2).map((attr: any, i: number) => (
                    <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                      <attr.icon
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0"
                        style={{ color: `${borderColor}90` }}
                        strokeWidth={2}
                      />
                      <span className="text-[10px] sm:text-[11px] text-zinc-600 dark:text-zinc-400 leading-tight truncate">
                        {attr.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* More attributes text */}
              {data.moreCount && (
                <p className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 mt-1.5 sm:mt-2 hidden sm:block">
                  +{data.moreCount} More Attributes
                </p>
              )}
            </>
          )}
        </div>

        {/* Source Handle - only right */}
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

// Define node types
const nodeTypes = {
  entityNode: EntityNode,
};

// Individual workflow nodes - Desktop positions
const individualNodesDesktop: Node[] = [
  // Three small job source cards
  {
    id: "linkedin",
    type: "entityNode",
    position: { x: 50, y: 50 },
    data: {
      icon: Linkedin,
      title: "LinkedIn",
      color: "#0A66C2",
      size: "small",
    },
  },
  {
    id: "naukri",
    type: "entityNode",
    position: { x: 50, y: 160 },
    data: {
      icon: Search,
      title: "Naukri",
      color: "#4A90E2",
      size: "small",
    },
  },
  {
    id: "indeed",
    type: "entityNode",
    position: { x: 50, y: 270 },
    data: {
      icon: BriefcaseAlt,
      title: "Indeed",
      color: "#2164F3",
      size: "small",
    },
  },
  // Job Description Processing
  {
    id: "jobDescription",
    type: "entityNode",
    position: { x: 280, y: 135 },
    data: {
      icon: FileSearch,
      title: "Job Description",
      category: "Standard",
      color: "#06B6D4",
      attributes: [
        { icon: Settings, text: "Processing job data" },
        { icon: Target, text: "Role requirements" },
      ],
      moreCount: 8,
    },
  },
  // AI Analysis
  {
    id: "aiAnalysis",
    type: "entityNode",
    position: { x: 540, y: 20 },
    data: {
      icon: Brain,
      title: "AI Analysis",
      category: "Standard",
      color: "#8B5CF6",
      attributes: [
        { icon: MessageSquare, text: "Profile matching" },
        { icon: Zap, text: "Skill assessment" },
      ],
      moreCount: 6,
    },
  },
  // Mock Interview
  {
    id: "mockInterview",
    type: "entityNode",
    position: { x: 800, y: 150 },
    data: {
      icon: UserCheck,
      title: "Mock Interview",
      category: "Standard",
      color: "#F59E0B",
      attributes: [
        { icon: MessageSquare, text: "Practice questions" },
        { icon: TrendingUp, text: "Real-time feedback" },
      ],
      moreCount: 12,
    },
  },
  // Results
  {
    id: "results",
    type: "entityNode",
    position: { x: 1060, y: 100 },
    data: {
      icon: Award,
      title: "Results",
      category: "Output",
      color: "#10B981",
      attributes: [
        { icon: BarChart3, text: "Performance report" },
        { icon: Target, text: "Improvement areas" },
      ],
      moreCount: 10,
    },
  },
];

// Individual workflow nodes - Mobile positions (scaled down)
const individualNodesMobile: Node[] = [
  {
    id: "linkedin",
    type: "entityNode",
    position: { x: 20, y: 20 },
    data: {
      icon: Linkedin,
      title: "LinkedIn",
      color: "#0A66C2",
      size: "small",
    },
  },
  {
    id: "naukri",
    type: "entityNode",
    position: { x: 20, y: 100 },
    data: {
      icon: Search,
      title: "Naukri",
      color: "#4A90E2",
      size: "small",
    },
  },
  {
    id: "indeed",
    type: "entityNode",
    position: { x: 20, y: 180 },
    data: {
      icon: BriefcaseAlt,
      title: "Indeed",
      color: "#2164F3",
      size: "small",
    },
  },
  {
    id: "jobDescription",
    type: "entityNode",
    position: { x: 180, y: 100 },
    data: {
      icon: FileSearch,
      title: "Job Description",
      category: "Standard",
      color: "#06B6D4",
      attributes: [
        { icon: Settings, text: "Processing job data" },
        { icon: Target, text: "Role requirements" },
      ],
      moreCount: 8,
    },
  },
  {
    id: "aiAnalysis",
    type: "entityNode",
    position: { x: 340, y: 20 },
    data: {
      icon: Brain,
      title: "AI Analysis",
      category: "Standard",
      color: "#8B5CF6",
      attributes: [
        { icon: MessageSquare, text: "Profile matching" },
        { icon: Zap, text: "Skill assessment" },
      ],
      moreCount: 6,
    },
  },
  {
    id: "mockInterview",
    type: "entityNode",
    position: { x: 500, y: 100 },
    data: {
      icon: UserCheck,
      title: "Mock Interview",
      category: "Standard",
      color: "#F59E0B",
      attributes: [
        { icon: MessageSquare, text: "Practice questions" },
        { icon: TrendingUp, text: "Real-time feedback" },
      ],
      moreCount: 12,
    },
  },
  {
    id: "results",
    type: "entityNode",
    position: { x: 660, y: 60 },
    data: {
      icon: Award,
      title: "Results",
      category: "Output",
      color: "#10B981",
      attributes: [
        { icon: BarChart3, text: "Performance report" },
        { icon: Target, text: "Improvement areas" },
      ],
      moreCount: 10,
    },
  },
];

// Individual workflow edges
const individualEdges: Edge[] = [
  // Job sources to Job Description
  {
    id: "e-linkedin-jd",
    source: "linkedin",
    target: "jobDescription",
    animated: true,
    style: { stroke: "#0A66C2", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#0A66C2",
      width: 20,
      height: 20,
    },
  },
  {
    id: "e-naukri-jd",
    source: "naukri",
    target: "jobDescription",
    animated: true,
    style: { stroke: "#4A90E2", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#4A90E2",
      width: 20,
      height: 20,
    },
  },
  {
    id: "e-indeed-jd",
    source: "indeed",
    target: "jobDescription",
    animated: true,
    style: { stroke: "#2164F3", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#2164F3",
      width: 20,
      height: 20,
    },
  },
  // Job Description to AI Analysis
  {
    id: "e-jd-analysis",
    source: "jobDescription",
    target: "aiAnalysis",
    animated: true,
    style: { stroke: "#06B6D4", strokeWidth: 2.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#06B6D4",
      width: 22,
      height: 22,
    },
  },
  // AI Analysis to Mock Interview
  {
    id: "e-analysis-mock",
    source: "aiAnalysis",
    target: "mockInterview",
    animated: true,
    style: { stroke: "#8B5CF6", strokeWidth: 2.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#8B5CF6",
      width: 22,
      height: 22,
    },
  },
  // Mock Interview to Results
  {
    id: "e-mock-results",
    source: "mockInterview",
    target: "results",
    animated: true,
    style: { stroke: "#F59E0B", strokeWidth: 2.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#F59E0B",
      width: 22,
      height: 22,
    },
  },
];

// Enterprise workflow nodes - Desktop
const enterpriseNodesDesktop: Node[] = [
  {
    id: "sources",
    type: "entityNode",
    position: { x: 50, y: 200 },
    data: {
      icon: Globe,
      title: "Job Sources",
      category: "Input",
      color: "#3B82F6",
      attributes: [
        { icon: Linkedin, text: "LinkedIn integration" },
        { icon: Search, text: "Naukri.com sync" },
      ],
      moreCount: 6,
    },
  },
  {
    id: "processing",
    type: "entityNode",
    position: { x: 400, y: 0 },
    data: {
      icon: Users,
      title: "Data Processing",
      category: "Process",
      color: "#8B5CF6",
      attributes: [
        { icon: FileSearch, text: "JD analysis" },
        { icon: UserCheck, text: "Candidate matching" },
      ],
      moreCount: 10,
    },
  },
  {
    id: "aiInterview",
    type: "entityNode",
    position: { x: 750, y: 250 },
    data: {
      icon: Brain,
      title: "AI Interview & Analysis",
      category: "Process",
      color: "#F59E0B",
      attributes: [
        { icon: MessageSquare, text: "Automated interviews" },
        { icon: Zap, text: "Real-time scoring" },
      ],
      moreCount: 15,
    },
  },
  {
    id: "reports",
    type: "entityNode",
    position: { x: 1100, y: 200 },
    data: {
      icon: FileText,
      title: "Detailed Reports",
      category: "Output",
      color: "#10B981",
      attributes: [
        { icon: BarChart3, text: "Candidate rankings" },
        { icon: TrendingUp, text: "Comprehensive analytics" },
      ],
      moreCount: 12,
    },
  },
];

// Enterprise workflow nodes - Mobile
const enterpriseNodesMobile: Node[] = [
  {
    id: "sources",
    type: "entityNode",
    position: { x: 20, y: 150 },
    data: {
      icon: Globe,
      title: "Job Sources",
      category: "Input",
      color: "#3B82F6",
      attributes: [
        { icon: Linkedin, text: "LinkedIn integration" },
        { icon: Search, text: "Naukri.com sync" },
      ],
      moreCount: 6,
    },
  },
  {
    id: "processing",
    type: "entityNode",
    position: { x: 280, y: 0 },
    data: {
      icon: Users,
      title: "Data Processing",
      category: "Process",
      color: "#8B5CF6",
      attributes: [
        { icon: FileSearch, text: "JD analysis" },
        { icon: UserCheck, text: "Candidate matching" },
      ],
      moreCount: 10,
    },
  },
  {
    id: "aiInterview",
    type: "entityNode",
    position: { x: 540, y: 180 },
    data: {
      icon: Brain,
      title: "AI Interview & Analysis",
      category: "Process",
      color: "#F59E0B",
      attributes: [
        { icon: MessageSquare, text: "Automated interviews" },
        { icon: Zap, text: "Real-time scoring" },
      ],
      moreCount: 15,
    },
  },
  {
    id: "reports",
    type: "entityNode",
    position: { x: 800, y: 150 },
    data: {
      icon: FileText,
      title: "Detailed Reports",
      category: "Output",
      color: "#10B981",
      attributes: [
        { icon: BarChart3, text: "Candidate rankings" },
        { icon: TrendingUp, text: "Comprehensive analytics" },
      ],
      moreCount: 12,
    },
  },
];

// Enterprise workflow edges
const enterpriseEdges: Edge[] = [
  {
    id: "e-sources-processing",
    source: "sources",
    target: "processing",
    animated: true,
    style: { stroke: "#3B82F6", strokeWidth: 3 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#3B82F6",
      width: 25,
      height: 25,
    },
    label: "Job Descriptions",
    labelStyle: { fontWeight: 700 },
  },
  {
    id: "e-processing-interview",
    source: "processing",
    target: "aiInterview",
    animated: true,
    style: { stroke: "#8B5CF6", strokeWidth: 3 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#8B5CF6",
      width: 25,
      height: 25,
    },
    label: "Shortlisted Candidates",
    labelStyle: { fontWeight: 700 },
  },
  {
    id: "e-interview-reports",
    source: "aiInterview",
    target: "reports",
    animated: true,
    style: { stroke: "#F59E0B", strokeWidth: 3 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#F59E0B",
      width: 25,
      height: 25,
    },
    label: "Analysis Results",
    labelStyle: { fontWeight: 700 },
  },
];

// Inner component that uses ReactFlow hooks
function WorkflowDiagramInner() {
  const [workflowType, setWorkflowType] = useState<"individual" | "enterprise">(
    "individual"
  );
  const [isMobile, setIsMobile] = useState(false);
  const { fitView } = useReactFlow();

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get responsive nodes based on screen size
  const currentNodes = useMemo(() => {
    if (workflowType === "individual") {
      return isMobile ? individualNodesMobile : individualNodesDesktop;
    } else {
      return isMobile ? enterpriseNodesMobile : enterpriseNodesDesktop;
    }
  }, [workflowType, isMobile]);

  const currentEdges =
    workflowType === "individual" ? individualEdges : enterpriseEdges;

  const [nodes, setNodes, onNodesChange] = useNodesState(currentNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Update nodes and edges when workflow type or screen size changes
  useEffect(() => {
    setNodes(currentNodes);
    setEdges(currentEdges);
  }, [workflowType, isMobile, currentNodes, currentEdges, setNodes, setEdges]);

  // Fit view when nodes or screen size changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({
        padding: isMobile ? 0.1 : 0.2,
        minZoom: isMobile ? 0.3 : 0.5,
        maxZoom: isMobile ? 1.2 : 1.5,
        duration: 300,
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [isMobile, workflowType, fitView]);

  return (
    <>
      <style>{customStyles}</style>
      <div className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
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
    </>
  );
}

// Main component with ReactFlowProvider
export default function WorkflowDiagram() {
  return (
    <ReactFlowProvider>
      <WorkflowDiagramInner />
    </ReactFlowProvider>
  );
}
