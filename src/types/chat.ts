export interface Attachment {
  type: "image" | "file";
  name: string;
  size: number;
  mimeType: string;
  data: string; // base64 encoded
  preview?: string; // For images
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  attachments?: Attachment[];
}

