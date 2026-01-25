import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

/**
 * Get all folders for the current authenticated user
 */
export const getUserFolders = query({
  args: {},
  handler: async (ctx) => {
    let user;
    try {
      user = await authComponent.getAuthUser(ctx);
      if (!user) {
        return [];
      }
    } catch (error) {
      return [];
    }

    const userId = user._id.toString();
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Sort by order
    folders.sort((a, b) => a.order - b.order);

    return folders;
  },
});

/**
 * Create a new folder
 */
export const createFolder = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated to create folders");
    }

    const userId = user._id.toString();

    // Get the highest order number for this user
    const existingFolders = await ctx.db
      .query("folders")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const maxOrder = existingFolders.length > 0
      ? Math.max(...existingFolders.map((f) => f.order))
      : -1;

    const now = Date.now();
    const folderId = await ctx.db.insert("folders", {
      userId,
      name: args.name,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    });

    return folderId;
  },
});

/**
 * Update folder name
 */
export const updateFolder = mutation({
  args: {
    folderId: v.id("folders"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated to update folders");
    }

    const userId = user._id.toString();

    // Verify ownership
    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new Error("Folder not found");
    }

    if (folder.userId !== userId) {
      throw new Error("Unauthorized: You can only update your own folders");
    }

    // Update folder
    await ctx.db.patch(args.folderId, {
      name: args.name,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete a folder
 * When a folder is deleted, chats inside it are unassigned (folderId = null) but not deleted
 */
export const deleteFolder = mutation({
  args: {
    folderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated to delete folders");
    }

    const userId = user._id.toString();

    // Verify ownership
    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new Error("Folder not found");
    }

    if (folder.userId !== userId) {
      throw new Error("Unauthorized: You can only delete your own folders");
    }

    // Unassign all chats from this folder
    const chatsInFolder = await ctx.db
      .query("chats")
      .withIndex("by_user_and_folder", (q) =>
        q.eq("userId", userId).eq("folderId", args.folderId)
      )
      .collect();

    // Update all chats to remove folderId
    await Promise.all(
      chatsInFolder.map((chat) =>
        ctx.db.patch(chat._id, {
          folderId: undefined,
        })
      )
    );

    // Delete the folder
    await ctx.db.delete(args.folderId);

    return { success: true, unassignedChats: chatsInFolder.length };
  },
});

/**
 * Reorder folders
 */
export const reorderFolders = mutation({
  args: {
    folderIds: v.array(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated to reorder folders");
    }

    const userId = user._id.toString();

    // Verify all folders belong to the user and update their order
    await Promise.all(
      args.folderIds.map(async (folderId, index) => {
        const folder = await ctx.db.get(folderId);
        if (!folder) {
          throw new Error(`Folder ${folderId} not found`);
        }

        if (folder.userId !== userId) {
          throw new Error(`Unauthorized: Folder ${folderId} does not belong to you`);
        }

        await ctx.db.patch(folderId, {
          order: index,
          updatedAt: Date.now(),
        });
      })
    );

    return { success: true };
  },
});
