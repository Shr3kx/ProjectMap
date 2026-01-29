import type { RoadmapNodeData } from "@/types/roadmap";

// Multiple regex patterns to handle various formatting variations of roadmap-json code blocks
// Pattern 1: Standard format with backticks and optional whitespace
const ROADMAP_JSON_REGEX_STANDARD = /```\s*roadmap-json\s*\n([\s\S]*?)\n```/;

// Pattern 2: More lenient - handles extra whitespace before/after content
const ROADMAP_JSON_REGEX_LENIENT =
  /```\s*roadmap-json\s*\n?([\s\S]*?)\n?\s*```/;

// Pattern 3: Handles case where there's no newline after opening backticks
const ROADMAP_JSON_REGEX_NO_NEWLINE = /```roadmap-json\s*([\s\S]*?)\s*```/;

// Pattern 4: For malformed blocks that might have extra whitespace
const ROADMAP_JSON_REGEX_AGGRESSIVE =
  /`{3}\s*roadmap-json\s*\n?([\s\S]*?)\n?\s*`{3}/;

// Try to extract JSON from roadmap-json code block using multiple patterns
function extractRoadmapJson(content: string): string | null {
  const patterns = [
    ROADMAP_JSON_REGEX_STANDARD,
    ROADMAP_JSON_REGEX_LENIENT,
    ROADMAP_JSON_REGEX_NO_NEWLINE,
    ROADMAP_JSON_REGEX_AGGRESSIVE,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

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
  // Try to extract roadmap JSON using multiple patterns
  const rawBlock = extractRoadmapJson(content);

  if (!rawBlock) {
    return { contentWithoutRoadmap: content, roadmapData: null };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBlock) as unknown;
  } catch (error) {
    console.error(
      "Failed to parse roadmap JSON:",
      error,
      "Raw block:",
      rawBlock,
    );
    return { contentWithoutRoadmap: content, roadmapData: null };
  }

  const arr = Array.isArray(parsed) ? parsed : [parsed];
  const nodes: RoadmapNodeData[] = [];
  for (const item of arr) {
    if (!isValidNode(item)) {
      console.warn("Invalid roadmap node:", item);
      continue;
    }
    nodes.push({
      id: item.id,
      title: item.title,
      description:
        typeof item.description === "string" ? item.description : undefined,
      status: item.status,
      x: item.x,
      y: item.y,
      depth: item.depth,
      parentId: typeof item.parentId === "string" ? item.parentId : undefined,
      children: Array.isArray(item.children)
        ? (item.children as string[]).filter(
            (c): c is string => typeof c === "string",
          )
        : undefined,
    });
  }

  if (nodes.length === 0) {
    return { contentWithoutRoadmap: content, roadmapData: null };
  }

  // Remove ALL variations of roadmap-json code blocks from the content
  let contentWithoutRoadmap = content;
  const removalPatterns = [
    ROADMAP_JSON_REGEX_STANDARD,
    ROADMAP_JSON_REGEX_LENIENT,
    ROADMAP_JSON_REGEX_NO_NEWLINE,
    ROADMAP_JSON_REGEX_AGGRESSIVE,
  ];

  for (const pattern of removalPatterns) {
    contentWithoutRoadmap = contentWithoutRoadmap.replace(pattern, "");
  }

  // Clean up extra whitespace and newlines
  contentWithoutRoadmap = contentWithoutRoadmap
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { contentWithoutRoadmap, roadmapData: nodes };
}
