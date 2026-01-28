import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import type { RoadmapNodeData } from "@/types/roadmap";

interface RoadmapStep {
  id: string;
  title: string;
  type?: "topic" | "subtopic";
  position: "main" | "branch";
  parentId?: string;
}

interface ProjectMapProps {
  userContext?: string;
  steps?: RoadmapStep[];
}

// Custom Topic Node
const TopicNode = ({ data, selected }: any) => {
  return (
    <div
      style={{
        background: "#FFD43B",
        color: "#000",
        padding: "12px 20px",
        borderRadius: "8px",
        border: "2px solid #000",
        fontSize: "15px",
        fontWeight: "600",
        minWidth: "180px",
        textAlign: "center",
        cursor: "pointer",
        boxShadow: selected
          ? "0 4px 12px rgba(0,0,0,0.15)"
          : "0 2px 4px rgba(0,0,0,0.1)",
        transition: "all 0.2s ease",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = selected
          ? "0 4px 12px rgba(0,0,0,0.15)"
          : "0 2px 4px rgba(0,0,0,0.1)";
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#3B82F6", width: "8px", height: "8px" }}
      />
      {data.label}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#3B82F6", width: "8px", height: "8px" }}
      />
    </div>
  );
};

// Custom Subtopic Node
const SubtopicNode = ({ data, selected }: any) => {
  return (
    <div
      style={{
        background: "#FFD43B",
        color: "#000",
        padding: "8px 16px",
        borderRadius: "8px",
        border: "2px solid #000",
        fontSize: "13px",
        fontWeight: "500",
        minWidth: "140px",
        textAlign: "center",
        cursor: "pointer",
        boxShadow: selected
          ? "0 3px 8px rgba(0,0,0,0.15)"
          : "0 1px 3px rgba(0,0,0,0.1)",
        transition: "all 0.2s ease",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.2)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = selected
          ? "0 3px 8px rgba(0,0,0,0.15)"
          : "0 1px 3px rgba(0,0,0,0.1)";
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#3B82F6", width: "6px", height: "6px" }}
      />
      {data.label}
    </div>
  );
};

const nodeTypes = {
  topic: TopicNode,
  subtopic: SubtopicNode,
};

// Custom edge styles
const getEdgeStyle = (isMainPath: boolean) => ({
  stroke: "#3B82F6",
  strokeWidth: isMainPath ? 3 : 2,
  strokeDasharray: isMainPath ? "0" : "5,5",
});

export function ProjectMap({ userContext, steps }: ProjectMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const roadmapData = useMemo(() => {
    if (steps) {
      return generateRoadmapFromSteps(steps);
    }
    return generateRoadmapFromContext(userContext);
  }, [userContext, steps]);

  React.useEffect(() => {
    setNodes(roadmapData.nodes);
    setEdges(roadmapData.edges);
  }, [roadmapData, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#fafafa",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: false,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#3B82F6",
            width: 20,
            height: 20,
          },
        }}
        connectionLineStyle={{ stroke: "#3B82F6", strokeWidth: 2 }}
        snapToGrid={true}
        snapGrid={[20, 20]}
        minZoom={0.3}
        maxZoom={2}
      >
        <Background color="#e5e7eb" gap={20} size={1} variant="dots" />
        <Controls
          showInteractive={false}
          style={{
            button: {
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              color: "#333",
            },
          }}
        />
      </ReactFlow>
    </div>
  );
}

// Enhanced roadmap generator
function generateRoadmapFromSteps(steps: RoadmapStep[]) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const mainSteps = steps.filter(s => s.position !== "branch");
  const branchSteps = steps.filter(s => s.position === "branch");

  // Main vertical path
  mainSteps.forEach((step, index) => {
    nodes.push({
      id: step.id,
      type: step.type || "topic",
      position: { x: 200, y: 80 + index * 140 },
      data: { label: step.title },
    });

    if (index > 0) {
      edges.push({
        id: `e-${mainSteps[index - 1].id}-${step.id}`,
        source: mainSteps[index - 1].id,
        target: step.id,
        type: "smoothstep",
        ...getEdgeStyle(true),
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#3B82F6",
          width: 20,
          height: 20,
        },
      });
    }
  });

  // Branch nodes to the right
  const branchGroups = branchSteps.reduce(
    (acc, step) => {
      if (!acc[step.parentId!]) {
        acc[step.parentId!] = [];
      }
      acc[step.parentId!].push(step);
      return acc;
    },
    {} as Record<string, RoadmapStep[]>,
  );

  Object.entries(branchGroups).forEach(([parentId, branches]) => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return;

    branches.forEach((branch, index) => {
      const branchX = parentNode.position.x + 350;
      const branchY = parentNode.position.y - 20 + index * 100;

      nodes.push({
        id: branch.id,
        type: branch.type || "subtopic",
        position: { x: branchX, y: branchY },
        data: { label: branch.title },
      });

      edges.push({
        id: `e-${parentId}-${branch.id}`,
        source: parentId,
        target: branch.id,
        type: "smoothstep",
        ...getEdgeStyle(false),
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#3B82F6",
          width: 18,
          height: 18,
        },
      });
    });
  });

  return { nodes, edges };
}

function generateRoadmapFromContext(context: string) {
  const parsedSteps = parseUserContext(context);
  return generateRoadmapFromSteps(parsedSteps);
}

function parseUserContext(context: string): RoadmapStep[] {
  // Your parsing logic here
  return [
    { id: "1", title: "Internet", type: "topic", position: "main" },
    {
      id: "1-1",
      title: "How does the internet work?",
      type: "subtopic",
      parentId: "1",
      position: "branch",
    },
    {
      id: "1-2",
      title: "What is HTTP?",
      type: "subtopic",
      parentId: "1",
      position: "branch",
    },
    {
      id: "1-3",
      title: "What is Domain Name?",
      type: "subtopic",
      parentId: "1",
      position: "branch",
    },
    { id: "2", title: "HTML", type: "topic", position: "main" },
    { id: "3", title: "CSS", type: "topic", position: "main" },
    { id: "4", title: "JavaScript", type: "topic", position: "main" },
    { id: "5", title: "Version Control", type: "topic", position: "main" },
    {
      id: "5-1",
      title: "Git",
      type: "subtopic",
      parentId: "5",
      position: "branch",
    },
    { id: "6", title: "VCS Hosting", type: "topic", position: "main" },
    {
      id: "6-1",
      title: "GitHub",
      type: "subtopic",
      parentId: "6",
      position: "branch",
    },
    {
      id: "6-2",
      title: "GitLab",
      type: "subtopic",
      parentId: "6",
      position: "branch",
    },
    { id: "7", title: "Package Managers", type: "topic", position: "main" },
    {
      id: "7-1",
      title: "npm",
      type: "subtopic",
      parentId: "7",
      position: "branch",
    },
    {
      id: "7-2",
      title: "yarn",
      type: "subtopic",
      parentId: "7",
      position: "branch",
    },
    {
      id: "7-3",
      title: "pnpm",
      type: "subtopic",
      parentId: "7",
      position: "branch",
    },
  ];
}
