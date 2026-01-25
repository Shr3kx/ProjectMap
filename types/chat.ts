// Chat message type definitions for ProjectMap

import type { RoadmapNodeData } from "./roadmap";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  modelName?: string;
  timeTaken?: number;
  /** Parsed roadmap nodes when AI returns a roadmap-json code block */
  roadmapData?: RoadmapNodeData[];
  /** Raw API response when roadmap was parsed; used for persisting to DB */
  rawContent?: string;
}

export interface Attachment {
  type: "image" | "file";
  name: string;
  size: number;
  data: string; // base64 encoded
  mimeType: string;
  preview?: string; // For images, a thumbnail URL or base64
}
