import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chats: defineTable({
    userId: v.string(), // User ID from Better Auth
    conversationId: v.optional(v.string()), // Optional conversation/thread ID to group messages
    chatName: v.optional(v.string()), // Name of the chat/conversation
    isPinned: v.optional(v.boolean()), // Whether the chat is pinned
    folderId: v.optional(v.id("folders")), // Optional folder ID
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    timestamp: v.number(),
    // Optional fields
    attachments: v.optional(
      v.array(
        v.object({
          type: v.union(v.literal("image"), v.literal("file")),
          name: v.string(),
          size: v.number(),
          data: v.string(), // base64 encoded
          mimeType: v.string(),
          preview: v.optional(v.string()),
        })
      )
    ),
    modelName: v.optional(v.string()),
    timeTaken: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_conversation", ["conversationId"])
    .index("by_user_and_conversation", ["userId", "conversationId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user_and_pinned", ["userId", "isPinned"])
    .index("by_user_and_folder", ["userId", "folderId"]),
  folders: defineTable({
    userId: v.string(),
    name: v.string(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_order", ["userId", "order"]),
});
