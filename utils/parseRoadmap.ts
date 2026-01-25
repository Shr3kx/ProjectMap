import type { RoadmapNodeData } from "@/types/roadmap";

const ROADMAP_JSON_REGEX = /```roadmap-json\s*\n([\s\S]*?)\n```/;

function isValidNode(raw: unknown): raw is RoadmapNodeData {
  if (!raw || typeof raw !== "object") return false;
  const o = raw as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    ["active", "completed", "pending", "idea"].includes(String(o.status)) &&
    typeof o.x === "number" &&
    typeof o.y === "number" &&
    typeof o.depth === "number"
  );
}

export function parseRoadmapFromContent(content: string): {
  contentWithoutRoadmap: string;
  roadmapData: RoadmapNodeData[] | null;
} {
  const match = content.match(ROADMAP_JSON_REGEX);
  if (!match) {
    return { contentWithoutRoadmap: content, roadmapData: null };
  }

  const rawBlock = match[1].trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBlock) as unknown;
  } catch {
    return { contentWithoutRoadmap: content, roadmapData: null };
  }

  const arr = Array.isArray(parsed) ? parsed : [parsed];
  const nodes: RoadmapNodeData[] = [];
  for (const item of arr) {
    if (!isValidNode(item)) continue;
    nodes.push({
      id: item.id,
      title: item.title,
      description: typeof item.description === "string" ? item.description : undefined,
      status: item.status,
      x: item.x,
      y: item.y,
      depth: item.depth,
      parentId: typeof item.parentId === "string" ? item.parentId : undefined,
      children: Array.isArray(item.children)
        ? (item.children as string[]).filter((c): c is string => typeof c === "string")
        : undefined,
    });
  }

  if (nodes.length === 0) {
    return { contentWithoutRoadmap: content, roadmapData: null };
  }

  const contentWithoutRoadmap = content.replace(ROADMAP_JSON_REGEX, "").replace(/\n{3,}/g, "\n\n").trim();
  return { contentWithoutRoadmap, roadmapData: nodes };
}
