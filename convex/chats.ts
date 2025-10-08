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

// Enhanced function to generate smart chat titles from user question and AI response
function generateSmartChatTitle(userMessage: string, aiResponse: string): string {
  if (!userMessage || userMessage.trim() === "") return "New Chat";
  
  const userMsg = userMessage.trim();
  const aiMsg = aiResponse.trim();
  
  // Define patterns for different types of conversations
  const patterns = {
    // Code-related conversations
    code: /\b(code|function|class|method|algorithm|debug|error|fix|implement|create|build|javascript|python|react|html|css|sql|api|database|frontend|backend)\b/i,
    // Project/planning conversations  
    project: /\b(project|plan|roadmap|timeline|task|feature|requirement|design|architecture|app|website|system|platform|tool|dashboard)\b/i,
    // Learning/explanation conversations
    learning: /\b(how|what|why|explain|learn|understand|difference|between|tutorial|guide)\b/i,
    // Problem-solving conversations
    problem: /\b(problem|issue|solve|help|stuck|error|bug|troubleshoot|fix)\b/i,
    // Analysis/comparison conversations
    analysis: /\b(compare|versus|vs|difference|better|best|analyze|review|pros|cons)\b/i,
  };
  
  // Extract key topics from both messages
  const extractKeywords = (text: string): string[] => {
    // Remove common words and extract meaningful terms
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
    
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word))
      .slice(0, 5);
  };
  
  const userKeywords = extractKeywords(userMsg);
  const aiKeywords = extractKeywords(aiMsg);
  
  // Combine and prioritize keywords
  const allKeywords = [...new Set([...userKeywords, ...aiKeywords])];
  
  // Try to identify conversation type and generate appropriate title
  let conversationType = '';
  let typeKeywords: string[] = [];
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(userMsg) || pattern.test(aiMsg)) {
      conversationType = type;
      typeKeywords = allKeywords.filter(keyword => pattern.test(keyword));
      break;
    }
  }
  
  // Generate title based on conversation type
  let title = '';
  
  if (userMsg.endsWith('?')) {
    // For questions, extract the core question
    const questionWords = userMsg.replace(/[?]/g, '').split(/\s+/);
    if (questionWords.length <= 8) {
      title = userMsg;
    } else {
      // Extract key part of the question
      const keyPart = questionWords.slice(0, 6).join(' ');
      title = keyPart + '?';
    }
  } else if (conversationType === 'code' && typeKeywords.length > 0) {
    // Code-related: "Build React App" or "Fix JavaScript Error"
    const codeKeywords = typeKeywords.slice(0, 3);
    title = codeKeywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  } else if (conversationType === 'project' && typeKeywords.length > 0) {
    // Project-related: "Project Roadmap Planning" or "App Development Plan"
    const projectKeywords = typeKeywords.slice(0, 3);
    title = projectKeywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  } else if (conversationType === 'learning') {
    // Learning: "How to Learn React" or "Understanding APIs"
    if (userMsg.toLowerCase().startsWith('how')) {
      title = userMsg.split(/\s+/).slice(0, 6).join(' ');
    } else {
      const topKeywords = allKeywords.slice(0, 3);
      title = 'Understanding ' + topKeywords.join(' ');
    }
  } else if (conversationType === 'problem') {
    // Problem-solving: "Debugging React Issue" or "Solving Database Problem"
    const problemKeywords = allKeywords.slice(0, 3);
    title = 'Solving ' + problemKeywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  } else if (conversationType === 'analysis') {
    // Analysis: "React vs Vue Comparison" or "Database Analysis"
    const analysisKeywords = allKeywords.slice(0, 3);
    title = analysisKeywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Analysis';
  } else {
    // Fallback: Use most important keywords
    const topKeywords = allKeywords.slice(0, 4);
    if (topKeywords.length > 0) {
      title = topKeywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    } else {
      // Ultimate fallback: first few words of user message
      const words = userMsg.split(/\s+/);
      title = words.slice(0, 5).join(' ');
    }
  }
  
  // Clean up and truncate title
  title = title.replace(/\s+/g, ' ').trim();
  
  // Ensure title isn't too long
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }
  
  // Ensure title isn't too short or generic
  if (title.length < 3 || title.toLowerCase() === 'new chat') {
    const fallbackWords = userMsg.split(/\s+/).slice(0, 4);
    title = fallbackWords.join(' ');
    if (title.length > 40) {
      title = title.substring(0, 37) + '...';
    }
  }
  
  return title || "New Chat";
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
    
    // If this is the first assistant response, update the chat title using smart generation
    if (args.type === "assistant") {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_chatId", q => q.eq("chatId", args.chatId))
        .collect();
      
      const assistantMessages = messages.filter(msg => msg.type === "assistant");
      
      if (assistantMessages.length === 1) {
        // This is the first assistant response, generate smart title from user question and AI response
        const userMessages = messages.filter(msg => msg.type === "user");
        const firstUserMessage = userMessages[0];
        
        if (firstUserMessage) {
          const smartTitle = generateSmartChatTitle(firstUserMessage.content, args.content);
          await ctx.db.patch(args.chatId, {
            title: smartTitle,
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