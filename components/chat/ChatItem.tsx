"use client";

import * as React from "react";
import { MessageSquare, MoreVertical, Pin, Folder, Trash2, FolderPlus } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import toast from "react-hot-toast";
import type { Id } from "@/convex/_generated/dataModel";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";

interface ChatItemProps {
  conversationId: string;
  chatName: string;
  isPinned: boolean;
  folderId?: Id<"folders">;
  folders?: Array<{ _id: Id<"folders">; name: string }>;
  onFolderChange?: () => void;
}

export function ChatItem({
  conversationId,
  chatName,
  isPinned,
  folderId,
  folders = [],
  onFolderChange,
}: ChatItemProps) {
  const togglePin = useMutation(api.chats.togglePinConversation);
  const moveToFolder = useMutation(api.chats.moveConversationToFolder);
  const removeFromFolder = useMutation(api.chats.removeConversationFromFolder);
  const deleteConversation = useMutation(api.chats.deleteConversation);

  const [isPinning, setIsPinning] = React.useState(false);
  const [isMoving, setIsMoving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const handlePin = async () => {
    setIsPinning(true);
    try {
      await togglePin({
        conversationId,
        isPinned: !isPinned,
      });
      toast.success(isPinned ? "Chat unpinned" : "Chat pinned");
    } catch (error) {
      console.error("Failed to pin/unpin chat:", error);
      toast.error("Failed to update pin status");
    } finally {
      setIsPinning(false);
    }
  };

  const handleMoveToFolder = async (targetFolderId: Id<"folders">) => {
    setIsMoving(true);
    try {
      await moveToFolder({
        conversationId,
        folderId: targetFolderId,
      });
      toast.success("Chat moved to folder");
      onFolderChange?.();
    } catch (error) {
      console.error("Failed to move chat:", error);
      toast.error("Failed to move chat");
    } finally {
      setIsMoving(false);
    }
  };

  const handleRemoveFromFolder = async () => {
    setIsMoving(true);
    try {
      await removeFromFolder({
        conversationId,
      });
      toast.success("Chat removed from folder");
      onFolderChange?.();
    } catch (error) {
      console.error("Failed to remove chat from folder:", error);
      toast.error("Failed to remove chat from folder");
    } finally {
      setIsMoving(false);
    }
  };

  const handleDeleteClick = () => setShowDeleteModal(true);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteConversation({
        conversationId,
      });
      toast.success("Chat deleted");
      onFolderChange?.();
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast.error("Failed to delete chat");
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SidebarMenuItem>
      <div className="group flex items-center gap-1 w-full">
        <SidebarMenuButton className="flex-1 bg-card" asChild>
          <a href="#">
            <MessageSquare className="size-4" />
            <span className="truncate">{chatName}</span>
          </a>
        </SidebarMenuButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-accent transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handlePin} disabled={isPinning}>
              <Pin className="size-4" />
              <span>{isPinned ? "Unpin" : "Pin"} chat</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger disabled={isMoving || folders.length === 0}>
                <Folder className="size-4" />
                <span>Move to folder</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {folderId && (
                  <>
                    <DropdownMenuItem onClick={handleRemoveFromFolder} disabled={isMoving}>
                      <FolderPlus className="size-4" />
                      <span>Remove from folder</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {folders.map((folder) => (
                  <DropdownMenuItem
                    key={folder._id}
                    onClick={() => handleMoveToFolder(folder._id)}
                    disabled={isMoving || folder._id === folderId}
                  >
                    <Folder className="size-4" />
                    <span>{folder.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDeleteClick}
              disabled={isDeleting}
              variant="destructive"
            >
              <Trash2 className="size-4" />
              <span>Delete chat</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ConfirmDeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete chat"
        description="Are you sure you want to delete this chat? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </SidebarMenuItem>
  );
}
