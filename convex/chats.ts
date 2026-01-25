import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

/**
 * Generate a chat name from the first user message
 * Creates a concise, readable title (max 50 characters)
 */
function generateChatName(firstUserMessage: string): string {
  // Remove extra whitespace and trim
  let cleaned = firstUserMessage.trim().replace(/\s+/g, " ");

  // Remove common question words at the start
  const questionPrefixes = /^(what|how|why|when|where|who|can|could|would|should|is|are|do|does|did|will|tell me|explain|describe|help me|i want|i need)\s+/i;
  cleaned = cleaned.replace(questionPrefixes, "");

  // Extract first sentence or first 50 characters
  const firstSentence = cleaned.split(/[.!?]/)[0].trim();
  let title = firstSentence || cleaned;

  // Limit to 50 characters
  if (title.length > 50) {
    // Try to cut at a word boundary
    const truncated = title.substring(0, 47);
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > 30) {
      title = truncated.substring(0, lastSpace) + "...";
    } else {
      title = truncated + "...";
    }
  }

  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  // Fallback if empty
  if (!title || title.trim().length === 0) {
    title = "New Chat";
  }

  return title;
}

/**
 * Save a chat message to the database
 * Only works for authenticated users
 */
export const saveMessage = mutation({
  args: {
    conversationId: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    timestamp: v.number(),
    attachments: v.optional(
      v.array(
        v.object({
          type: v.union(v.literal("image"), v.literal("file")),
          name: v.string(),
          size: v.number(),
          data: v.string(),
          mimeType: v.string(),
          preview: v.optional(v.string()),
        })
      )
    ),
    modelName: v.optional(v.string()),
    timeTaken: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get the current authenticated user
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated to save chats");
    }

    const userId = user._id.toString();
    let chatName: string | undefined = undefined;

    // Generate chat name if this is the first message in a conversation
    if (args.conversationId && args.role === "user") {
      // Check if this is the first message in this conversation
      const existingMessages = await ctx.db
        .query("chats")
        .withIndex("by_user_and_conversation", (q) =>
          q.eq("userId", userId).eq("conversationId", args.conversationId)
        )
        .collect();

      // If no messages exist yet, generate a name from the first user message
      if (existingMessages.length === 0) {
        chatName = generateChatName(args.content);
      } else {
        // Get the chat name from existing messages
        const existingMessageWithName = existingMessages.find((m) => m.chatName);
        if (existingMessageWithName) {
          chatName = existingMessageWithName.chatName;
        }
      }
    }

    // Save the message
    const messageId = await ctx.db.insert("chats", {
      userId,
      conversationId: args.conversationId,
      chatName,
      role: args.role,
      content: args.content,
      timestamp: args.timestamp,
      attachments: args.attachments,
      modelName: args.modelName,
      timeTaken: args.timeTaken,
    });

    return messageId;
  },
});

/**
 * Save multiple messages at once (useful for saving a conversation)
 * Only works for authenticated users
 */
export const saveMessages = mutation({
  args: {
    conversationId: v.optional(v.string()),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        timestamp: v.number(),
        attachments: v.optional(
          v.array(
            v.object({
              type: v.union(v.literal("image"), v.literal("file")),
              name: v.string(),
              size: v.number(),
              data: v.string(),
              mimeType: v.string(),
              preview: v.optional(v.string()),
            })
          )
        ),
        modelName: v.optional(v.string()),
        timeTaken: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Get the current authenticated user
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated to save chats");
    }

    const userId = user._id.toString();
    let chatName: string | undefined = undefined;

    // Generate chat name from the first user message if this is a new conversation
    if (args.conversationId) {
      const existingMessages = await ctx.db
        .query("chats")
        .withIndex("by_user_and_conversation", (q) =>
          q.eq("userId", userId).eq("conversationId", args.conversationId)
        )
        .collect();

      if (existingMessages.length === 0) {
        // Find the first user message to generate name from
        const firstUserMessage = args.messages.find((m) => m.role === "user");
        if (firstUserMessage) {
          chatName = generateChatName(firstUserMessage.content);
        }
      } else {
        // Get existing chat name
        const existingMessageWithName = existingMessages.find((m) => m.chatName);
        if (existingMessageWithName) {
          chatName = existingMessageWithName.chatName;
        }
      }
    }

    // Save all messages
    const messageIds = await Promise.all(
      args.messages.map((message) =>
        ctx.db.insert("chats", {
          userId,
          conversationId: args.conversationId,
          chatName,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp,
          attachments: message.attachments,
          modelName: message.modelName,
          timeTaken: message.timeTaken,
        })
      )
    );

    return messageIds;
  },
});

/**
 * Get all chats for the current authenticated user
 * Returns messages ordered by timestamp (oldest first)
 */
export const getUserChats = query({
  args: {
    conversationId: v.optional(v.string()), // Optional: filter by conversation ID
    limit: v.optional(v.number()), // Optional: limit number of results
  },
  handler: async (ctx, args) => {
    // Get the current authenticated user
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      return [];
    }

    // Build query based on whether conversationId is provided
    const userId = user._id.toString();
    let query;
    if (args.conversationId) {
      query = ctx.db
        .query("chats")
        .withIndex("by_user_and_conversation", (q) =>
          q.eq("userId", userId).eq("conversationId", args.conversationId)
        );
    } else {
      query = ctx.db
        .query("chats")
        .withIndex("by_user", (q) => q.eq("userId", userId));
    }

    // Get messages and sort by timestamp
    let messages = await query.collect();
    messages.sort((a, b) => a.timestamp - b.timestamp);

    // Apply limit if provided
    if (args.limit) {
      messages = messages.slice(-args.limit); // Get last N messages
    }

    return messages;
  },
});

/**
 * Get all unique conversation IDs for the current authenticated user
 */
export const getUserConversations = query({
  args: {},
  handler: async (ctx) => {
    // Get the current authenticated user
    // Return empty array if user is not authenticated
    let user;
    try {
      user = await authComponent.getAuthUser(ctx);
      if (!user) {
        return [];
      }
    } catch (error) {
      // User is not authenticated, return empty array
      return [];
    }

    // Get all messages for the user
    const userId = user._id.toString();
    const messages = await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Extract unique conversation IDs
    const conversationIds = new Set<string>();
    messages.forEach((msg) => {
      if (msg.conversationId) {
        conversationIds.add(msg.conversationId);
      }
    });

    // For each conversation, get the latest message timestamp, chat name, pinned status, and folder
    const conversations = Array.from(conversationIds).map((convId) => {
      const convMessages = messages.filter((m) => m.conversationId === convId);
      const latestMessage = convMessages.reduce((latest, msg) =>
        msg.timestamp > latest.timestamp ? msg : latest
      );
      // Get chat name, pinned status, and folderId from any message (they should all have the same values)
      const firstMessage = convMessages[0];
      const chatName = firstMessage.chatName || "New Chat";
      const isPinned = firstMessage.isPinned || false;
      const folderId = firstMessage.folderId || undefined;
      return {
        conversationId: convId,
        chatName,
        isPinned,
        folderId,
        lastMessageTimestamp: latestMessage.timestamp,
        messageCount: convMessages.length,
      };
    });

    // Sort by last message timestamp (newest first)
    conversations.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);

    return conversations;
  },
});

/**
 * Delete a specific message (only if it belongs to the current user)
 */
export const deleteMessage = mutation({
  args: {
    messageId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    // Get the current authenticated user
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated to delete chats");
    }

    // Get the message to verify ownership
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    const userId = user._id.toString();
    if (message.userId !== userId) {
      throw new Error("Unauthorized: You can only delete your own messages");
    }

    // Delete the message
    await ctx.db.delete(args.messageId);
    return { success: true };
  },
});

/**
 * Delete all messages in a conversation (only if they belong to the current user)
 */
export const deleteConversation = mutation({
  args: {
    conversationId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the current authenticated user
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated to delete conversations");
    }

    // Get all messages in the conversation for this user
    const userId = user._id.toString();
    const messages = await ctx.db
      .query("chats")
      .withIndex("by_user_and_conversation", (q) =>
        q.eq("userId", userId).eq("conversationId", args.conversationId)
      )
      .collect();

    // Delete all messages
    await Promise.all(messages.map((msg) => ctx.db.delete(msg._id)));

    return { success: true, deletedCount: messages.length };
  },
});

/**
 * Pin or unpin a conversation
 * Updates all messages in the conversation to have the same pinned status
 */
export const togglePinConversation = mutation({
  args: {
    conversationId: v.string(),
    isPinned: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated to pin conversations");
    }

    const userId = user._id.toString();

    // Get all messages in the conversation
    const messages = await ctx.db
      .query("chats")
      .withIndex("by_user_and_conversation", (q) =>
        q.eq("userId", userId).eq("conversationId", args.conversationId)
      )
      .collect();

    if (messages.length === 0) {
      throw new Error("Conversation not found");
    }

    // Update all messages in the conversation
    await Promise.all(
      messages.map((msg) =>
        ctx.db.patch(msg._id, {
          isPinned: args.isPinned,
        })
      )
    );

    return { success: true, updatedCount: messages.length };
  },
});

/**
 * Move a conversation to a folder (or remove from folder)
 */
export const moveConversationToFolder = mutation({
  args: {
    conversationId: v.string(),
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated to move conversations");
    }

    const userId = user._id.toString();

    // Verify folder ownership if folderId is provided
    if (args.folderId) {
      const folder = await ctx.db.get(args.folderId);
      if (!folder) {
        throw new Error("Folder not found");
      }
      if (folder.userId !== userId) {
        throw new Error("Unauthorized: You can only move chats to your own folders");
      }
    }

    // Get all messages in the conversation
    const messages = await ctx.db
      .query("chats")
      .withIndex("by_user_and_conversation", (q) =>
        q.eq("userId", userId).eq("conversationId", args.conversationId)
      )
      .collect();

    if (messages.length === 0) {
      throw new Error("Conversation not found");
    }

    // Update all messages in the conversation
    await Promise.all(
      messages.map((msg) =>
        ctx.db.patch(msg._id, {
          folderId: args.folderId,
        })
      )
    );

    return { success: true, updatedCount: messages.length };
  },
});

/**
 * Remove conversation from folder
 */
export const removeConversationFromFolder = mutation({
  args: {
    conversationId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated to remove conversations from folders");
    }

    const userId = user._id.toString();

    // Get all messages in the conversation
    const messages = await ctx.db
      .query("chats")
      .withIndex("by_user_and_conversation", (q) =>
        q.eq("userId", userId).eq("conversationId", args.conversationId)
      )
      .collect();

    if (messages.length === 0) {
      throw new Error("Conversation not found");
    }

    // Update all messages to remove folderId
    await Promise.all(
      messages.map((msg) =>
        ctx.db.patch(msg._id, {
          folderId: undefined,
        })
      )
    );

    return { success: true, updatedCount: messages.length };
  },
});
