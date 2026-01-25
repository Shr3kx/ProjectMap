// Chat message type definitions for ProjectMap

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  modelName?: string;
  timeTaken?: number;
}

export interface Attachment {
  type: "image" | "file";
  name: string;
  size: number;
  data: string; // base64 encoded
  mimeType: string;
  preview?: string; // For images, a thumbnail URL or base64
}
