import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  }).index("by_clerkId", ["clerkId"]),

  folders: defineTable({
    userId: v.string(),
    name: v.string(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_order", ["userId", "order"]),

  chats: defineTable({
    userId: v.string(),
    title: v.string(),
    folderId: v.optional(v.id("folders")),
    isPinned: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_folderId", ["userId", "folderId"])
    .index("by_userId_and_isPinned", ["userId", "isPinned"]),

  messages: defineTable({
    chatId: v.id("chats"),
    userId: v.string(),
    content: v.string(),
    type: v.string(), // "user" or "assistant"
    timestamp: v.number(),
  })
    .index("by_chatId", ["chatId"])
    .index("by_userId", ["userId"]),
});
