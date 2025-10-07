import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper function to generate a chat name from the first message
function generateChatName(message: string): string {
  // If message is empty, return default name
  if (!message || message.trim() === "") return "New Chat";
  
  // Try to extract a headline or meaningful phrase
  const lines = message.split(/\n+/);
  const firstLine = lines[0].trim();
  
  // If first line is a question, use it directly
  if (firstLine.endsWith("?") && firstLine.length <= 50) {
    return firstLine;
  }
  
  // Look for potential headlines (short lines that might be titles)
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length > 0 && trimmedLine.length <= 50 && 
        !trimmedLine.endsWith(".") && trimmedLine.split(/\s+/).length <= 10) {
      return trimmedLine;
    }
  }
  
  // Extract key phrases or first sentence
  const sentences = firstLine.split(/[.!?]+/);
  const firstSentence = sentences[0].trim();
  
  if (firstSentence.length <= 50) {
    return firstSentence;
  }
  
  // Fallback: Take first few words
  const words = firstLine.split(/\s+/);
  const nameWords = words.slice(0, 5);
  let name = nameWords.join(" ");
  
  // Truncate if still too long and add ellipsis
  if (name.length > 40) {
    name = name.substring(0, 40) + "...";
  }
  
  return name || "New Chat";
}

// Create a new chat
export const createChat = mutation({
  args: {
    userId: v.string(),
    initialMessage: v.string(),
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Create the chat
    const chatId = await ctx.db.insert("chats", {
      userId: args.userId,
      title: generateChatName(args.initialMessage),
      folderId: args.folderId,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    });
    
    // Add the initial message
    await ctx.db.insert("messages", {
      chatId,
      userId: args.userId,
      content: args.initialMessage,
      type: "user",
      timestamp: now,
    });
    
    return chatId;
  },
});

// Add a message to a chat
export const addMessage = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.string(),
    content: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Add the message
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      userId: args.userId,
      content: args.content,
      type: args.type,
      timestamp: now,
    });
    
    // Update the chat's updatedAt timestamp
    await ctx.db.patch(args.chatId, {
      updatedAt: now,
    });
    
    // If this is the first assistant response, update the chat title
    if (args.type === "assistant") {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_chatId", q => q.eq("chatId", args.chatId))
        .collect();
      
      const assistantMessages = messages.filter(msg => msg.type === "assistant");
      
      if (assistantMessages.length === 1) {
        // This is the first assistant response, update the title
        const chat = await ctx.db.get(args.chatId);
        if (chat) {
          await ctx.db.patch(args.chatId, {
            title: generateChatName(args.content),
          });
        }
      }
    }
    
    return messageId;
  },
});

// Get all chats for a user
export const getUserChats = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("chats")
      .withIndex("by_userId", q => q.eq("userId", args.userId))
      .order("desc", r => r.updatedAt)
      .collect();
  },
});

// Get chats in a specific folder
export const getFolderChats = query({
  args: {
    userId: v.string(),
    folderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("chats")
      .withIndex("by_userId_and_folderId", q => 
        q.eq("userId", args.userId).eq("folderId", args.folderId)
      )
      .order("desc", r => r.updatedAt)
      .collect();
  },
});

// Get pinned chats
export const getPinnedChats = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("chats")
      .withIndex("by_userId_and_isPinned", q => 
        q.eq("userId", args.userId).eq("isPinned", true)
      )
      .order("desc", r => r.updatedAt)
      .collect();
  },
});

// Get a single chat by ID
export const getChat = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    return ctx.db.get(args.chatId);
  },
});

// Get messages for a chat
export const getChatMessages = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("messages")
      .withIndex("by_chatId", q => q.eq("chatId", args.chatId))
      .order("asc", r => r.timestamp)
      .collect();
  },
});

// Update a chat (title, folder, pinned status)
export const updateChat = mutation({
  args: {
    chatId: v.id("chats"),
    title: v.optional(v.string()),
    folderId: v.optional(v.union(v.id("folders"), v.null())),
    isPinned: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }
    
    const updates: any = {
      updatedAt: Date.now(),
    };
    
    if (args.title !== undefined) {
      updates.title = args.title;
    }
    
    if (args.folderId !== undefined) {
      updates.folderId = args.folderId === null ? undefined : args.folderId;
    }
    
    if (args.isPinned !== undefined) {
      updates.isPinned = args.isPinned;
    }
    
    return ctx.db.patch(args.chatId, updates);
  },
});

// Delete a chat
export const deleteChat = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    // First delete all messages in the chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", q => q.eq("chatId", args.chatId))
      .collect();
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    
    // Then delete the chat
    await ctx.db.delete(args.chatId);
    
    return true;
  },
});