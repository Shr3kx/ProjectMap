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
const EntityNode = ({
  data,
  isLightbox = false,
}: {
  data: any;
  isLightbox?: boolean;
}) => {
  // Icon can be either a string (from JSON) or a component (from processed nodes)
  const IconComponent = React.useMemo(() => {
    if (typeof data.icon === "string") {
      return iconMap[data.icon] || Map;
    }
    return data.icon || Map;
  }, [data.icon]);
  const borderColor = data.color || "#34C759";
  const isSmall = data.size === "small";

  // Scale everything up for lightbox mode
  const nodeWidth = isLightbox
    ? isSmall
      ? "min-w-[280px] max-w-[320px]"
      : "min-w-[380px] max-w-[450px]"
    : isSmall
      ? "min-w-[140px] max-w-[160px] sm:min-w-[160px] sm:max-w-[180px]"
      : "min-w-[200px] max-w-[240px] sm:min-w-[240px] sm:max-w-[280px]";

  return (
    <div className="relative">
      <div
        className={`relative bg-white dark:bg-zinc-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${nodeWidth}`}
        style={{
          border: `2px solid ${borderColor}40`,
        }}
      >
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: borderColor,
            width: isLightbox ? 12 : 8,
            height: isLightbox ? 12 : 8,
            border: "2px solid white",
          }}
        />

        <div
          className={
            isLightbox
              ? isSmall
                ? "p-4"
                : "p-5"
              : isSmall
                ? "p-3 sm:p-3.5"
                : "p-3.5 sm:p-4"
          }
        >
          {isSmall ? (
            <div className="flex flex-col items-center gap-2 sm:gap-2.5">
              <div
                className={
                  isLightbox ? "p-4 rounded-xl" : "p-3 sm:p-3.5 rounded-lg"
                }
                style={{ backgroundColor: `${borderColor}15` }}
              >
                <IconComponent
                  className={isLightbox ? "w-8 h-8" : "w-5 h-5 sm:w-6 sm:h-6"}
                  style={{ color: borderColor }}
                  strokeWidth={isLightbox ? 2.5 : 2}
                />
              </div>
              <h4
                className={`font-bold text-center leading-tight ${
                  isLightbox ? "text-base" : "text-xs sm:text-sm"
                }`}
                style={{ color: borderColor }}
              >
                {data.title}
              </h4>
            </div>
          ) : (
            <>
              <div
                className={`flex items-start justify-between gap-2 sm:gap-3 ${isLightbox ? "mb-4" : "mb-3 sm:mb-4"}`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div
                    className={
                      isLightbox ? "p-3 rounded-xl" : "p-2 sm:p-2.5 rounded-lg"
                    }
                    style={{ backgroundColor: `${borderColor}15` }}
                  >
                    <IconComponent
                      className={
                        isLightbox ? "w-6 h-6" : "w-5 h-5 sm:w-5 sm:h-5"
                      }
                      style={{ color: borderColor }}
                      strokeWidth={isLightbox ? 2.5 : 2}
                    />
                  </div>
                  <h4
                    className={`font-bold text-zinc-900 dark:text-zinc-100 leading-tight ${
                      isLightbox ? "text-lg" : "text-sm sm:text-base"
                    }`}
                  >
                    {data.title}
                  </h4>
                </div>
                {data.category && (
                  <span
                    className={`px-2.5 sm:px-3 py-1 font-semibold rounded-full whitespace-nowrap flex-shrink-0 ${
                      isLightbox ? "text-xs" : "text-[10px] sm:text-xs"
                    }`}
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
                <div
                  className={`space-y-2 sm:space-y-2.5 ${isLightbox ? "mb-3" : "mb-2 sm:mb-3"}`}
                >
                  {data.attributes
                    .slice(0, isLightbox ? 3 : 2)
                    .map((attr: any, i: number) => {
                      const AttrIcon = attr.icon
                        ? iconMap[attr.icon] || Target
                        : Target;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2 sm:gap-2.5"
                        >
                          <AttrIcon
                            className={
                              isLightbox
                                ? "w-5 h-5 flex-shrink-0"
                                : "w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0"
                            }
                            style={{ color: `${borderColor}90` }}
                            strokeWidth={isLightbox ? 2.5 : 2}
                          />
                          <span
                            className={`text-zinc-700 dark:text-zinc-300 leading-relaxed ${
                              isLightbox ? "text-sm" : "text-xs sm:text-sm"
                            }`}
                          >
                            {attr.text}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}

              {data.moreCount && (
                <p
                  className={`text-zinc-500 dark:text-zinc-400 mt-2 sm:mt-2.5 ${
                    isLightbox ? "text-sm" : "text-xs sm:text-sm"
                  }`}
                >
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
            width: isLightbox ? 12 : 8,
            height: isLightbox ? 12 : 8,
            border: "2px solid white",
          }}
        />
      </div>
    </div>
  );
};

// Create node types factory to pass isLightbox prop
const createNodeTypes = (isLightbox: boolean) => ({
  entityNode: (props: any) => <EntityNode {...props} isLightbox={isLightbox} />,
});

// Inner component that uses ReactFlow hooks
function RoadmapDiagramInner({
  roadmapData,
  fullHeight = false,
  isLightbox = false,
}: {
  roadmapData: any;
  fullHeight?: boolean;
  isLightbox?: boolean;
}) {
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

  const nodeTypes = React.useMemo(
    () => createNodeTypes(isLightbox),
    [isLightbox]
  );

  // Process nodes and edges from roadmap data
  const processedNodes = useMemo(() => {
    if (!roadmapData?.nodes) return [];
    return roadmapData.nodes.map((node: any, index: number) => {
      const IconComponent = node.data.icon
        ? iconMap[node.data.icon] || Map
        : Map;
      // Increase horizontal spacing between nodes for lightbox
      const baseSpacing = isLightbox ? 500 : 250;
      const adjustedX =
        isLightbox && node.position?.x
          ? node.position.x * (baseSpacing / 250)
          : node.position?.x || index * baseSpacing;
      return {
        ...node,
        position: {
          x: adjustedX,
          y: node.position?.y || 0,
        },
        data: {
          ...node.data,
          icon: IconComponent,
        },
      };
    });
  }, [roadmapData, isLightbox]);

  const processedEdges = useMemo(() => {
    if (!roadmapData?.edges) return [];
    return roadmapData.edges.map((edge: any) => ({
      ...edge,
      style: {
        ...edge.style,
        strokeWidth: isLightbox ? 3 : 2,
        strokeDasharray:
          edge.style?.strokeDasharray || (isLightbox ? "8,4" : "6,3"),
      },
      markerEnd: edge.markerEnd || {
        type: MarkerType.ArrowClosed,
        color: edge.style?.stroke || "#06B6D4",
        width: isLightbox ? 24 : 20,
        height: isLightbox ? 24 : 20,
      },
    }));
  }, [roadmapData, isLightbox]);

  const [nodes, setNodes, onNodesChange] = useNodesState(processedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(processedEdges);

  React.useEffect(() => {
    setNodes(processedNodes);
    setEdges(processedEdges);
  }, [processedNodes, processedEdges, setNodes, setEdges]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fitView({
        padding: isLightbox ? (isMobile ? 40 : 60) : isMobile ? 0.1 : 0.2,
        minZoom: isMobile ? 0.3 : isLightbox ? 0.4 : 0.5,
        maxZoom: isMobile ? 1.2 : isLightbox ? 2 : 1.5,
        duration: 300,
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [isMobile, fitView, isLightbox]);

  return (
    <div
      className={`w-full relative rounded-lg overflow-hidden ${
        fullHeight
          ? "h-full"
          : "h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] my-4"
      }`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        minZoom={isMobile ? 0.2 : isLightbox ? 0.3 : 0.5}
        maxZoom={isMobile ? 2 : isLightbox ? 2.5 : 1.5}
        defaultViewport={{
          x: 0,
          y: 0,
          zoom: isMobile ? 0.6 : isLightbox ? 0.7 : 0.85,
        }}
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

export function RoadmapRenderer({
  roadmapData,
  fullHeight = false,
  isLightbox = false,
}: {
  roadmapData: any;
  fullHeight?: boolean;
  isLightbox?: boolean;
}) {
  if (!roadmapData || !roadmapData.nodes || roadmapData.nodes.length === 0) {
    return null;
  }

  return (
    <ReactFlowProvider>
      <RoadmapDiagramInner
        roadmapData={roadmapData}
        fullHeight={fullHeight}
        isLightbox={isLightbox}
      />
    </ReactFlowProvider>
  );
}

// "use client";
// import React, { useMemo } from "react";
// import {
//   ReactFlow,
//   useNodesState,
//   useEdgesState,
//   ReactFlowProvider,
//   useReactFlow,
//   MarkerType,
// } from "@xyflow/react";
// import "@xyflow/react/dist/style.css";
// import {
//   Building2,
//   Users,
//   Brain,
//   FileText,
//   CheckCircle,
//   Briefcase,
//   Upload,
//   MessagesSquare,
//   Lightbulb,
//   Globe,
//   Linkedin,
//   Search,
//   FileSearch,
//   UserCheck,
//   Award,
//   Settings,
//   Target,
//   MessageSquare,
//   Zap,
//   TrendingUp,
//   BarChart3,
//   FolderKanban,
//   Map,
//   Database,
//   Shield,
//   Code2,
//   Lock,
//   TestTube,
//   Rocket,
//   Bug,
//   Terminal,
//   Package,
//   Wrench,
//   Server,
//   GitBranch,
//   CheckCircle2,
// } from "lucide-react";
// import { Handle, Position } from "@xyflow/react";

// // Full icon mapping (added missing ones from your data)
// const iconMap: Record<string, React.ComponentType<any>> = {
//   Building2,
//   Users,
//   Brain,
//   FileText,
//   CheckCircle,
//   Briefcase,
//   Upload,
//   MessagesSquare,
//   Lightbulb,
//   Globe,
//   Linkedin,
//   Search,
//   FileSearch,
//   UserCheck,
//   Award,
//   Settings,
//   Target,
//   MessageSquare,
//   Zap,
//   TrendingUp,
//   BarChart3,
//   FolderKanban,
//   Map,
//   Database,
//   Shield,
//   Code2,
//   Lock,
//   TestTube,
//   Rocket,
//   Bug,
//   Terminal,
//   Package,
//   Wrench,
//   Server,
//   GitBranch,
//   CheckCircle2,
// };

// // Custom Node Component – significantly improved visuals
// const EntityNode = ({
//   data,
//   isLightbox = false,
// }: {
//   data: any;
//   isLightbox?: boolean;
// }) => {
//   const IconComponent = React.useMemo(() => {
//     if (typeof data.icon === "string") {
//       return iconMap[data.icon] || Map;
//     }
//     return data.icon || Map;
//   }, [data.icon]);

//   const borderColor = data.color || "#06B6D4";
//   const isSmall = data.size === "small";

//   // Better sizing & spacing for lightbox
//   const nodeClass = isLightbox
//     ? isSmall
//       ? "min-w-[300px] max-w-[340px]"
//       : "min-w-[400px] max-w-[480px]"
//     : isSmall
//     ? "min-w-[160px] max-w-[200px]"
//     : "min-w-[240px] max-w-[300px]";

//   return (
//     <div className="relative">
//       <div
//         className={`relative bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] transition-all duration-500 overflow-hidden ${nodeClass}`}
//         style={{
//           border: `3px solid ${borderColor}`,
//           boxShadow: `0 10px 30px -10px ${borderColor}40`,
//         }}
//       >
//         {/* Subtle gradient overlay */}
//         <div
//           className="absolute inset-0 opacity-10"
//           style={{ background: `linear-gradient(135deg, ${borderColor}, transparent)` }}
//         />

//         <Handle
//           type="target"
//           position={Position.Left}
//           style={{
//             background: borderColor,
//             width: isLightbox ? 14 : 10,
//             height: isLightbox ? 14 : 10,
//             border: "3px solid white",
//             boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
//           }}
//         />

//         <div className={isLightbox ? (isSmall ? "p-5" : "p-6") : isSmall ? "p-4" : "p-5"}>
//           {isSmall ? (
//             // Small task node layout
//             <div className="flex flex-col items-center gap-4 text-center">
//               <div
//                 className="p-5 rounded-2xl"
//                 style={{ backgroundColor: `${borderColor}20` }}
//               >
//                 <IconComponent
//                   className={isLightbox ? "w-12 h-12" : "w-8 h-8"}
//                   style={{ color: borderColor }}
//                   strokeWidth={2.5}
//                 />
//               </div>
//               <h4
//                 className={`font-extrabold leading-tight ${isLightbox ? "text-lg" : "text-sm"}`}
//                 style={{ color: borderColor }}
//               >
//                 {data.title}
//               </h4>
//             </div>
//           ) : (
//             // Phase (large) node layout
//             <>
//               <div className="flex items-center justify-between mb-5">
//                 <div className="flex items-center gap-4 flex-1 min-w-0">
//                   <div
//                     className="p-4 rounded-2xl"
//                     style={{ backgroundColor: `${borderColor}20` }}
//                   >
//                     <IconComponent
//                       className="w-10 h-10"
//                       style={{ color: borderColor }}
//                       strokeWidth={2.5}
//                     />
//                   </div>
//                   <h3
//                     className={`font-extrabold text-xl md:text-2xl truncate ${isLightbox ? "text-2xl" : ""}`}
//                     style={{ color: borderColor }}
//                   >
//                     {data.title}
//                   </h3>
//                 </div>
//               </div>

//               {data.attributes && data.attributes.length > 0 && (
//                 <div className="space-y-3">
//                   {data.attributes.map((attr: any, i: number) => {
//                     const AttrIcon = attr.icon ? iconMap[attr.icon] || Target : Target;
//                     return (
//                       <div key={i} className="flex items-center gap-3">
//                         <AttrIcon
//                           className="w-6 h-6 flex-shrink-0"
//                           style={{ color: borderColor }}
//                           strokeWidth={2}
//                         />
//                         <span className="text-zinc-800 dark:text-zinc-200 text-base font-medium">
//                           {attr.text}
//                         </span>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}

//               {data.moreCount && (
//                 <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-4 font-medium">
//                   +{data.moreCount} more
//                 </p>
//               )}
//             </>
//           )}
//         </div>

//         <Handle
//           type="source"
//           position={Position.Right}
//           style={{
//             background: borderColor,
//             width: isLightbox ? 14 : 10,
//             height: isLightbox ? 14 : 10,
//             border: "3px solid white",
//             boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
//           }}
//         />
//       </div>
//     </div>
//   );
// };

// const createNodeTypes = (isLightbox: boolean) => ({
//   entityNode: (props: any) => <EntityNode {...props} isLightbox={isLightbox} />,
// });

// function RoadmapDiagramInner({
//   roadmapData,
//   fullHeight = false,
//   isLightbox = false,
// }: {
//   roadmapData: any;
//   fullHeight?: boolean;
//   isLightbox?: boolean;
// }) {
//   const { fitView } = useReactFlow();

//   const nodeTypes = useMemo(() => createNodeTypes(isLightbox), [isLightbox]);

//   // Improved spacing – especially for lightbox
//   const processedNodes = useMemo(() => {
//     if (!roadmapData?.nodes) return [];
//     return roadmapData.nodes.map((node: any) => {
//       const IconComponent = node.data.icon ? iconMap[node.data.icon] || Map : Map;

//       // Wider spacing in lightbox for breathing room
//       const xMultiplier = isLightbox ? 1.8 : 1;
//       const adjustedX = (node.position?.x || 0) * xMultiplier;

//       return {
//         ...node,
//         position: {
//           x: adjustedX,
//           y: node.position?.y || 0,
//         },
//         data: {
//           ...node.data,
//           icon: IconComponent,
//         },
//       };
//     });
//   }, [roadmapData, isLightbox]);

//   const processedEdges = useMemo(() => {
//     if (!roadmapData?.edges) return [];
//     return roadmapData.edges.map((edge: any) => ({
//       ...edge,
//       animated: true,
//       style: {
//         stroke: edge.style?.stroke || "#888",
//         strokeWidth: isLightbox ? 4 : 3,
//       },
//       markerEnd: {
//         type: MarkerType.ArrowClosed,
//         color: edge.style?.stroke || "#888",
//         width: isLightbox ? 30 : 24,
//         height: isLightbox ? 30 : 24,
//       },
//     }));
//   }, [roadmapData, isLightbox]);

//   const [nodes, setNodes, onNodesChange] = useNodesState(processedNodes);
//   const [edges, setEdges, onEdgesChange] = useEdgesState(processedEdges);

//   React.useEffect(() => {
//     setNodes(processedNodes);
//     setEdges(processedEdges);
//   }, [processedNodes, processedEdges, setNodes, setEdges]);

//   // Better fitView with padding and smooth timing
//   React.useEffect(() => {
//     const timer = setTimeout(() => {
//       fitView({
//         padding: 0.15,
//         includeHiddenNodes: false,
//         duration: 600,
//         maxZoom: 1.2,
//       });
//     }, 150);

//     return () => clearTimeout(timer);
//   }, [fitView]);

//   return (
//     <div
//       className={`w-full h-full relative bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black rounded-2xl overflow-hidden ${
//         fullHeight ? "h-full" : "h-[500px] md:h-[700px]"
//       }`}
//     >
//       <ReactFlow
//         nodes={nodes}
//         edges={edges}
//         onNodesChange={onNodesChange}
//         onEdgesChange={onEdgesChange}
//         nodeTypes={nodeTypes}
//         fitViewOptions={{
//           padding: 0.15,
//           maxZoom: 1.2,
//         }}
//         minZoom={0.3}
//         maxZoom={2}
//         proOptions={{ hideAttribution: true }}
//         panOnDrag={true}
//         zoomOnScroll={true}
//         zoomOnDoubleClick={true}
//         selectNodesOnDrag={false}
//         className="touch-manipulation"
//       />
//     </div>
//   );
// }

// export function RoadmapRenderer({
//   roadmapData,
//   fullHeight = false,
//   isLightbox = false,
// }: {
//   roadmapData: any;
//   fullHeight?: boolean;
//   isLightbox?: boolean;
// }) {
//   if (!roadmapData || !roadmapData.nodes || roadmapData.nodes.length === 0) {
//     return null;
//   }

//   return (
//     <ReactFlowProvider>
//       <RoadmapDiagramInner
//         roadmapData={roadmapData}
//         fullHeight={fullHeight}
//         isLightbox={isLightbox}
//       />
//     </ReactFlowProvider>
//   );
// }
