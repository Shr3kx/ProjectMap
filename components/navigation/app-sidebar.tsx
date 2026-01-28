"use client";

import * as React from "react";
import { Brain, MessageSquarePlus, FolderPlus, Folder } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { ChatItem } from "@/components/chat/ChatItem";
import { useAuth } from "@/hooks/useAuth";
import { ClassicLoader } from "@/components/ui/loader";
import { AddFolderModal } from "@/components/modals/AddFolderModal";

type ChatSummary = {
  id: string;
  chat_name: string;
  folder_id: string | null;
  is_pinned: boolean | null;
};

type FolderSummary = {
  id: string;
  name: string;
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const [chats, setChats] = React.useState<ChatSummary[]>([]);
  const [folders, setFolders] = React.useState<FolderSummary[]>([]);
  const [loadingChats, setLoadingChats] = React.useState(false);
  const [loadingFolders, setLoadingFolders] = React.useState(false);
  const [addFolderContext, setAddFolderContext] = React.useState<{
    source: "sidebar" | "chat";
    chatId?: string;
  } | null>(null);

  React.useEffect(() => {
    if (!user) {
      setChats([]);
      setFolders([]);
      return;
    }

    const fetchChats = async () => {
      try {
        setLoadingChats(true);
        const res = await fetch("/api/chats");
        if (!res.ok) {
          console.error("Failed to fetch chats:", await res.text());
          return;
        }
        const data = await res.json();
        setChats(Array.isArray(data.chats) ? data.chats : []);
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoadingChats(false);
      }
    };

    const fetchFolders = async () => {
      try {
        setLoadingFolders(true);
        const res = await fetch("/api/folders");
        if (!res.ok) {
          console.error("Failed to fetch folders:", await res.text());
          return;
        }
        const data = await res.json();
        setFolders(Array.isArray(data.folders) ? data.folders : []);
      } catch (error) {
        console.error("Error fetching folders:", error);
      } finally {
        setLoadingFolders(false);
      }
    };

    void fetchChats();
    void fetchFolders();
  }, [user]);

  const handleTogglePin = async (chatId: string, nextPinned: boolean) => {
    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPinned: nextPinned }),
      });

      if (!res.ok) {
        console.error("Failed to update pinned state:", await res.text());
        return;
      }

      const { chat } = await res.json();
      setChats(prev =>
        prev.map(c => (c.id === chat.id ? { ...c, ...chat } : c)),
      );
    } catch (error) {
      console.error("Error updating pinned state:", error);
    }
  };

  const handleMoveToFolder = async (
    chatId: string,
    folderId: string | null,
  ) => {
    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folderId }),
      });

      if (!res.ok) {
        console.error("Failed to move chat to folder:", await res.text());
        return;
      }

      const { chat } = await res.json();
      setChats(prev =>
        prev.map(c => (c.id === chat.id ? { ...c, ...chat } : c)),
      );
    } catch (error) {
      console.error("Error moving chat to folder:", error);
    }
  };

  const handleAddFolder = () => {
    setAddFolderContext({ source: "sidebar" });
  };

  const handleFolderCreated = (folder: FolderSummary) => {
    setFolders(prev => [...prev, folder]);

    if (addFolderContext?.source === "chat" && addFolderContext.chatId) {
      void handleMoveToFolder(addFolderContext.chatId, folder.id);
    }

    setAddFolderContext(null);
  };

  const handleCreateFolderForChat = (chatId: string) => {
    setAddFolderContext({ source: "chat", chatId });
  };

  const handleDeleteChat = async (chatId: string) => {
    // eslint-disable-next-line no-alert
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this chat?",
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        console.error("Failed to delete chat:", await res.text());
        return;
      }

      setChats(prev => prev.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    // eslint-disable-next-line no-alert
    const confirmDelete = window.confirm(
      "Delete this folder? Chats inside will remain but be removed from the folder.",
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        console.error("Failed to delete folder:", await res.text());
        return;
      }

      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      setChats(prev =>
        prev.map(chat =>
          chat.folder_id === folderId ? { ...chat, folder_id: null } : chat,
        ),
      );
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  const pinnedChats = chats.filter(chat => chat.is_pinned);
  const unpinnedUnfolderedChats = chats.filter(
    chat => !chat.is_pinned && !chat.folder_id,
  );

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="md" asChild>
              <a href="/" className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Brain className="size-4" />
                </div>
                <span className="font-semibold text-lg">Project Map</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-2 py-2">
          <SidebarMenuButton size="sm" className="w-full skeuomorphic-button">
            <MessageSquarePlus className="size-4" />
            <span>New Chat</span>
          </SidebarMenuButton>
        </div>

        {user && pinnedChats.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-primary">
              <span className="flex items-center gap-2">
                <span>Pinned Chats</span>
              </span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {pinnedChats.map(chat => (
                  <ChatItem
                    key={chat.id}
                    id={chat.id}
                    chatName={chat.chat_name}
                    isPinned={!!chat.is_pinned}
                    folderId={chat.folder_id}
                    folders={folders}
                    onPinToggle={handleTogglePin}
                    onMoveToFolder={handleMoveToFolder}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {user && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-primary flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>Folders</span>
                {user && loadingFolders && <ClassicLoader size="sm" />}
              </span>
              <button
                type="button"
                onClick={handleAddFolder}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <FolderPlus className="size-3" />
                <span>Add</span>
              </button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {folders.length > 0 ? (
                  folders.map(folder => {
                    const folderChats = chats.filter(
                      chat => chat.folder_id === folder.id,
                    );

                    return (
                      <SidebarMenuItem key={folder.id} className="mb-1">
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center gap-2 justify-between">
                          <span className="inline-flex items-center gap-2 min-w-0">
                            <Folder className="size-3" />
                            <span className="truncate">{folder.name}</span>
                          </span>
                          <button
                            type="button"
                            className="text-[11px] text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteFolder(folder.id)}
                          >
                            Delete
                          </button>
                        </div>
                        {folderChats.length > 0 && (
                          <SidebarMenu className="pl-2">
                            {folderChats.map(chat => (
                              <ChatItem
                                key={chat.id}
                                id={chat.id}
                                chatName={chat.chat_name}
                                isPinned={!!chat.is_pinned}
                                folderId={chat.folder_id}
                                folders={folders}
                                onPinToggle={handleTogglePin}
                                onMoveToFolder={handleMoveToFolder}
                                onCreateFolderForChat={
                                  handleCreateFolderForChat
                                }
                                onDeleteChat={handleDeleteChat}
                                onDeleteFolder={handleDeleteFolder}
                              />
                            ))}
                          </SidebarMenu>
                        )}
                      </SidebarMenuItem>
                    );
                  })
                ) : (
                  <SidebarMenuItem>
                    <div className="px-2 py-2 text-sm text-muted-foreground">
                      No folders yet. Create one to organize your chats.
                    </div>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-primary">
            <span className="flex items-center gap-2">
              <span>Your Chats</span>
              {user && loadingChats && <ClassicLoader size="sm" />}
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {user && chats.length > 0 ? (
                unpinnedUnfolderedChats.map(chat => (
                  <ChatItem
                    key={chat.id}
                    id={chat.id}
                    chatName={chat.chat_name}
                    isPinned={!!chat.is_pinned}
                    folderId={chat.folder_id}
                    folders={folders}
                    onPinToggle={handleTogglePin}
                    onMoveToFolder={handleMoveToFolder}
                    onCreateFolderForChat={handleCreateFolderForChat}
                    onDeleteChat={handleDeleteChat}
                    onDeleteFolder={handleDeleteFolder}
                  />
                ))
              ) : (
                <SidebarMenuItem>
                  <div className="px-2 py-2 text-sm text-muted-foreground">
                    {user
                      ? "No chats yet. Start a conversation to see it here."
                      : "Sign in to save and view your chat history."}
                  </div>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <AddFolderModal
        open={!!addFolderContext}
        onOpenChange={open =>
          !open
            ? setAddFolderContext(null)
            : setAddFolderContext(prev => prev ?? { source: "sidebar" })
        }
        onFolderCreated={handleFolderCreated}
      />
    </Sidebar>
  );
}
