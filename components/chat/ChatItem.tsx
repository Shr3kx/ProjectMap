"use client";

import {
  MessageSquare,
  EllipsisVertical,
  Pin,
  PinOff,
  Folder,
  FolderX,
  Trash2,
} from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatItemProps {
  id: string;
  chatName: string;
  isPinned?: boolean | null;
  folderId?: string | null;
  folders?: { id: string; name: string }[];
  onPinToggle?: (chatId: string, nextPinned: boolean) => void;
  onMoveToFolder?: (chatId: string, folderId: string | null) => void;
  onCreateFolderForChat?: (chatId: string) => void;
  onDeleteChat?: (chatId: string) => void;
  onDeleteFolder?: (folderId: string) => void;
}

export function ChatItem({
  id,
  chatName,
  isPinned,
  folderId,
  folders,
  onPinToggle,
  onMoveToFolder,
  onCreateFolderForChat,
  onDeleteChat,
  onDeleteFolder,
}: ChatItemProps) {
  return (
    <SidebarMenuItem>
      <div className="flex items-center gap-1">
        <SidebarMenuButton className="flex-1 bg-card justify-start" asChild>
          <a href="#">
            <MessageSquare className="size-4" />
            <span className="truncate">{chatName}</span>
          </a>
        </SidebarMenuButton>
        {(onPinToggle || onMoveToFolder) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <EllipsisVertical className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Chat actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onPinToggle?.(id, !isPinned)}
              >
                {isPinned ? (
                  <>
                    <PinOff className="size-4" />
                    <span>Unpin chat</span>
                  </>
                ) : (
                  <>
                    <Pin className="size-4" />
                    <span>Pin chat</span>
                  </>
                )}
              </DropdownMenuItem>
              {onMoveToFolder && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Folder className="size-4" />
                      <span>Move to folder</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {folders && folders.length > 0 ? (
                        <>
                          {folders.map(folder => (
                            <DropdownMenuItem
                              key={folder.id}
                              onClick={() => onMoveToFolder(id, folder.id)}
                            >
                              <Folder className="size-4" />
                              <span className="truncate">
                                {folder.name}
                              </span>
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem
                            onClick={() => onCreateFolderForChat?.(id)}
                          >
                            <Folder className="size-4" />
                            <span>Create folder…</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={() => onMoveToFolder(id, null)}
                      >
                        <FolderX className="size-4" />
                        <span>Remove from folder</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDeleteChat?.(id)}
              >
                <Trash2 className="size-4" />
                <span>Delete chat</span>
              </DropdownMenuItem>
              {folderId && onDeleteFolder && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDeleteFolder(folderId)}
                >
                  <Trash2 className="size-4" />
                  <span>Delete folder</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </SidebarMenuItem>
  );
}
