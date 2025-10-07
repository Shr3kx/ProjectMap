import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new folder
export const createFolder = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Creating folder with userId:", args.userId);
    
    // Get the highest order to place the new folder at the end
    const existingFolders = await ctx.db
      .query("folders")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    
    console.log("Existing folders:", existingFolders.length);
    
    const maxOrder = existingFolders.length > 0
      ? Math.max(...existingFolders.map(folder => folder.order))
      : -1;
    
    const now = Date.now();
    
    const folderId = await ctx.db.insert("folders", {
      userId: args.userId,
      name: args.name,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    });
    
    console.log("Created folder with ID:", folderId);
    return folderId;
  },
});

// Get all folders for a user
export const getUserFolders = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("folders")
      .withIndex("by_userId_and_order", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Update a folder (rename)
export const updateFolder = mutation({
  args: {
    folderId: v.id("folders"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new Error("Folder not found");
    }
    
    return ctx.db.patch(args.folderId, {
      name: args.name,
      updatedAt: Date.now(),
    });
  },
});

// Reorder folders
export const reorderFolders = mutation({
  args: {
    folderOrders: v.array(
      v.object({
        folderId: v.id("folders"),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    for (const { folderId, order } of args.folderOrders) {
      await ctx.db.patch(folderId, {
        order,
        updatedAt: now,
      });
    }
    
    return true;
  },
});

// Delete a folder
export const deleteFolder = mutation({
  args: {
    folderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    // First, get all chats in this folder and remove the folder association
    // Get the folder to get the userId
    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new Error("Folder not found");
    }
    
    const chatsInFolder = await ctx.db
      .query("chats")
      .withIndex("by_userId_and_folderId", (q) => 
        q.eq("userId", folder.userId).eq("folderId", args.folderId)
      )
      .collect();
    
    for (const chat of chatsInFolder) {
      await ctx.db.patch(chat._id, {
        folderId: undefined,
        updatedAt: Date.now(),
      });
    }
    
    // Then delete the folder
    await ctx.db.delete(args.folderId);
    
    return true;
  },
});