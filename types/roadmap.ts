// Shared roadmap/mind-map node format used by AI and RoadmapMindMap

export type RoadmapNodeStatus = "active" | "completed" | "pending" | "idea";

export interface RoadmapNodeData {
  id: string;
  title: string;
  description?: string;
  status: RoadmapNodeStatus;
  x: number;
  y: number;
  depth: number;
  parentId?: string;
  children?: string[];
}
