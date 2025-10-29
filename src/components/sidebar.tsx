"use client";

import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronDown,
  ChevronRight,
  FolderClosed,
  FolderOpen,
  MessageSquare,
  MoreHorizontal,
  Pin,
  PinOff,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Edit2,
  FolderInput,
  Loader2,
} from "lucide-react";
import type * as React from "react";
import AppHeader from "./header";
import type { SidebarState } from "@/lib/sidebar-types";
import {
  createFolder as createLocalFolder,
  renameFolder as renameLocalFolder,
  deleteFolder as deleteLocalFolder,
  createChat as createLocalChat,
  togglePinChat as toggleLocalPinChat,
  assignChatToFolder as assignLocalChatToFolder,
  deleteChat as deleteLocalChat,
  getChatsByDate,
  getPinnedChats,
  getChatsByFolder,
} from "@/lib/sidebar-actions";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";

export function AppSidebar({
  children,
  onChatSelect,
  onNewChat,
}: {
  children: React.ReactNode;
  onChatSelect?: (chatId: string) => void;
  onNewChat?: () => void;
}) {
  const { user, isSignedIn, isLoaded } = useUser();
  const userId = user?.id;

  const [state, setState] = useState<SidebarState>({
    chats: [],
    folders: [],
  });

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [isRenameFolderDialogOpen, setIsRenameFolderDialogOpen] =
    useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  const [renameFolderName, setRenameFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Convex mutations
  const createConvexFolder = useMutation(api.folders.createFolder);
  const updateConvexFolder = useMutation(api.folders.updateFolder);
  const deleteConvexFolder = useMutation(api.folders.deleteFolder);
  const createConvexChat = useMutation(api.chats.createChat);
  const updateConvexChat = useMutation(api.chats.updateChat);
  const deleteConvexChat = useMutation(api.chats.deleteChat);

  // Convex queries
  const folders = useQuery(
    api.folders.getUserFolders,
    isSignedIn && userId ? { userId } : "skip"
  );
  const chats = useQuery(
    api.chats.getUserChats,
    isSignedIn && userId ? { userId } : "skip"
  );
  const pinnedChatsData = useQuery(
    api.chats.getPinnedChats,
    isSignedIn && userId ? { userId } : "skip"
  );

  // Load data from Convex when user is signed in
  useEffect(() => {
    if (isLoaded && isSignedIn && userId && folders && chats) {
      console.log("Loading data from Convex:", { userId, folders, chats });
      // Convert Convex data to local state format
      const formattedFolders = folders.map(folder => ({
        id: folder._id,
        name: folder.name,
      }));

      const formattedChats = chats.map(chat => ({
        id: chat._id,
        title: chat.title,
        folderId: chat.folderId,
        isPinned: chat.isPinned,
        createdAt: new Date(chat.createdAt),
      }));

      setState({
        folders: formattedFolders,
        chats: formattedChats,
      });
    } else if (isLoaded && !isSignedIn) {
      console.log("User not signed in, using local state");
    }
  }, [isLoaded, isSignedIn, userId, folders, chats]);

  const handleCreateChat = () => {
    // Trigger new chat reset in the main chat component
    onNewChat?.();
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    setIsLoading(true);
    try {
      if (isSignedIn && userId) {
        console.log("Creating folder in Convex with userId:", userId);
        // Create folder in Convex
        const result = await createConvexFolder({
          userId: userId,
          name: newFolderName.trim(),
        });
        console.log("Folder created in Convex:", result);

        // Force refresh the folders query
        setTimeout(() => {
          // This will trigger a re-fetch of the folders
          const dummyEvent = new Event("focus");
          window.dispatchEvent(dummyEvent);
        }, 500);
      } else {
        // Fallback to local state for unauthenticated users
        setState(prev => createLocalFolder(prev, newFolderName.trim()));
      }

      setNewFolderName("");
      setIsNewFolderDialogOpen(false);
    } catch (error) {
      console.error("Error creating folder:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameFolder = async () => {
    if (!renameFolderId || !renameFolderName.trim()) return;

    setIsLoading(true);
    try {
      if (userId) {
        // Update folder in Convex
        await updateConvexFolder({
          folderId: renameFolderId as any,
          name: renameFolderName.trim(),
        });

        // Convex will automatically update the queries
      } else {
        // Fallback to local state for unauthenticated users
        setState(prev =>
          renameLocalFolder(prev, renameFolderId, renameFolderName.trim())
        );
      }

      setRenameFolderId(null);
      setRenameFolderName("");
      setIsRenameFolderDialogOpen(false);
    } catch (error) {
      console.error("Error renaming folder:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    setIsLoading(true);
    try {
      if (userId) {
        // Delete folder in Convex
        await deleteConvexFolder({
          folderId: folderId as any,
        });

        // Convex will automatically update the queries
      } else {
        // Fallback to local state for unauthenticated users
        setState(prev => deleteLocalFolder(prev, folderId));
      }

      expandedFolders.delete(folderId);
      setExpandedFolders(new Set(expandedFolders));
    } catch (error) {
      console.error("Error deleting folder:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePin = async (chatId: string) => {
    setIsLoading(true);
    try {
      if (userId) {
        // Find the current chat to toggle its pinned status
        const chat = state.chats.find(c => c.id === chatId);
        if (chat) {
          await updateConvexChat({
            chatId: chatId as any,
            isPinned: !chat.isPinned,
          });
        }

        // Convex will automatically update the queries
      } else {
        // Fallback to local state for unauthenticated users
        setState(prev => toggleLocalPinChat(prev, chatId));
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignToFolder = async (
    chatId: string,
    folderId: string | null
  ) => {
    setIsLoading(true);
    try {
      if (userId) {
        // Update chat in Convex
        await updateConvexChat({
          chatId: chatId as any,
          folderId: folderId as any,
        });

        // Convex will automatically update the queries
      } else {
        // Fallback to local state for unauthenticated users
        setState(prev => assignLocalChatToFolder(prev, chatId, folderId));
      }
    } catch (error) {
      console.error("Error assigning chat to folder:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    setIsLoading(true);
    try {
      if (userId) {
        // Delete chat in Convex
        await deleteConvexChat({
          chatId: chatId as any,
        });

        // Convex will automatically update the queries
      } else {
        // Fallback to local state for unauthenticated users
        setState(prev => deleteLocalChat(prev, chatId));
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const openRenameDialog = (folderId: string, currentName: string) => {
    setRenameFolderId(folderId);
    setRenameFolderName(currentName);
    setIsRenameFolderDialogOpen(true);
  };

  // Use Convex data if available, otherwise fall back to local state
  const pinnedChats =
    userId && pinnedChatsData
      ? pinnedChatsData.map(chat => ({
          id: chat._id,
          title: chat.title,
          folderId: chat.folderId,
          isPinned: chat.isPinned,
          createdAt: new Date(chat.createdAt),
        }))
      : getPinnedChats(state.chats);

  const chatsByDate = getChatsByDate(state.chats);

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="offcanvas">
        <SidebarHeader>
          {/* Brand */}
          <div className="flex items-center gap-2 px-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Sparkles className="size-4" />
            </div>
            <span className="text-sm font-semibold">ProjectMap</span>
          </div>

          <div className="p-2">
            <Button
              className="w-full skeuomorphic-button"
              size="sm"
              onClick={handleCreateChat}
            >
              <MessageSquare className="mr-2 size-4" />
              New Chat
            </Button>
          </div>

          <div className="px-2 pb-2">
            <Button
              variant="outline"
              className="w-full bg-transparent"
              size="sm"
              onClick={() => setIsNewFolderDialogOpen(true)}
            >
              <Plus className="mr-2 size-4" />
              New Folder
            </Button>
          </div>

          {/* Search */}
          <div className="px-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-2 top-1/2 size-4 -translate-y-1/2" />
              <SidebarInput
                className="pl-8"
                placeholder="Search your chats..."
                aria-label="Search your chats"
              />
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {pinnedChats.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>
                <Pin className="mr-2 size-4" />
                Pinned Chats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {pinnedChats.map(chat => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton
                        onClick={() => onChatSelect?.(chat.id)}
                      >
                        <MessageSquare className="size-4" />
                        <span className="flex-1 truncate">{chat.title}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="hover:bg-accent rounded p-1">
                              <MoreHorizontal className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleTogglePin(chat.id)}
                            >
                              <PinOff className="mr-2 size-4" />
                              Unpin
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDeleteChat(chat.id)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {state.folders.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>
                <FolderClosed className="mr-2 size-4" />
                Folders
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {state.folders.map(folder => {
                    const folderChats = getChatsByFolder(
                      state.chats,
                      folder.id
                    );
                    const isExpanded = expandedFolders.has(folder.id);

                    return (
                      <div key={folder.id}>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => toggleFolder(folder.id)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="size-4" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )}
                            {isExpanded ? (
                              <FolderOpen className="size-4" />
                            ) : (
                              <FolderClosed className="size-4" />
                            )}
                            <span className="flex-1 truncate">
                              {folder.name}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {folderChats.length}
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="hover:bg-accent rounded p-1"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="size-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    openRenameDialog(folder.id, folder.name)
                                  }
                                >
                                  <Edit2 className="mr-2 size-4" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => handleDeleteFolder(folder.id)}
                                >
                                  <Trash2 className="mr-2 size-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </SidebarMenuButton>
                        </SidebarMenuItem>

                        {/* Folder chats */}
                        {isExpanded && folderChats.length > 0 && (
                          <div className="ml-4">
                            {folderChats.map(chat => (
                              <SidebarMenuItem key={chat.id}>
                                <SidebarMenuButton
                                  className="pl-6"
                                  onClick={() => onChatSelect?.(chat.id)}
                                >
                                  <MessageSquare className="size-4" />
                                  <span className="flex-1 truncate">
                                    {chat.title}
                                  </span>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className="hover:bg-accent rounded p-1">
                                        <MoreHorizontal className="size-4" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => handleTogglePin(chat.id)}
                                      >
                                        <Pin className="mr-2 size-4" />
                                        Pin
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleAssignToFolder(chat.id, null)
                                        }
                                      >
                                        <FolderInput className="mr-2 size-4" />
                                        Remove from folder
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() =>
                                          handleDeleteChat(chat.id)
                                        }
                                      >
                                        <Trash2 className="mr-2 size-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          <SidebarSeparator />

          {chatsByDate.today.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Today</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chatsByDate.today.map(chat => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton
                        onClick={() => onChatSelect?.(chat.id)}
                      >
                        <MessageSquare className="size-4" />
                        <span className="flex-1 truncate">{chat.title}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="hover:bg-accent rounded p-1">
                              <MoreHorizontal className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleTogglePin(chat.id)}
                            >
                              <Pin className="mr-2 size-4" />
                              Pin
                            </DropdownMenuItem>
                            {state.folders.length > 0 && (
                              <>
                                <DropdownMenuSeparator />
                                {state.folders.map(folder => (
                                  <DropdownMenuItem
                                    key={folder.id}
                                    onClick={() =>
                                      handleAssignToFolder(chat.id, folder.id)
                                    }
                                  >
                                    <FolderInput className="mr-2 size-4" />
                                    Move to {folder.name}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDeleteChat(chat.id)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {chatsByDate.yesterday.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Yesterday</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chatsByDate.yesterday.map(chat => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton
                        onClick={() => onChatSelect?.(chat.id)}
                      >
                        <MessageSquare className="size-4" />
                        <span className="flex-1 truncate">{chat.title}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="hover:bg-accent rounded p-1">
                              <MoreHorizontal className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleTogglePin(chat.id)}
                            >
                              <Pin className="mr-2 size-4" />
                              Pin
                            </DropdownMenuItem>
                            {state.folders.length > 0 && (
                              <>
                                <DropdownMenuSeparator />
                                {state.folders.map(folder => (
                                  <DropdownMenuItem
                                    key={folder.id}
                                    onClick={() =>
                                      handleAssignToFolder(chat.id, folder.id)
                                    }
                                  >
                                    <FolderInput className="mr-2 size-4" />
                                    Move to {folder.name}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDeleteChat(chat.id)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {chatsByDate.lastWeek.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Last 7 Days</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chatsByDate.lastWeek.map(chat => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton
                        onClick={() => onChatSelect?.(chat.id)}
                      >
                        <MessageSquare className="size-4" />
                        <span className="flex-1 truncate">{chat.title}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="hover:bg-accent rounded p-1">
                              <MoreHorizontal className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleTogglePin(chat.id)}
                            >
                              <Pin className="mr-2 size-4" />
                              Pin
                            </DropdownMenuItem>
                            {state.folders.length > 0 && (
                              <>
                                <DropdownMenuSeparator />
                                {state.folders.map(folder => (
                                  <DropdownMenuItem
                                    key={folder.id}
                                    onClick={() =>
                                      handleAssignToFolder(chat.id, folder.id)
                                    }
                                  >
                                    <FolderInput className="mr-2 size-4" />
                                    Move to {folder.name}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDeleteChat(chat.id)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {chatsByDate.older.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Older</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chatsByDate.older.map(chat => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton
                        onClick={() => onChatSelect?.(chat.id)}
                      >
                        <MessageSquare className="size-4" />
                        <span className="flex-1 truncate">{chat.title}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="hover:bg-accent rounded p-1">
                              <MoreHorizontal className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleTogglePin(chat.id)}
                            >
                              <Pin className="mr-2 size-4" />
                              Pin
                            </DropdownMenuItem>
                            {state.folders.length > 0 && (
                              <>
                                <DropdownMenuSeparator />
                                {state.folders.map(folder => (
                                  <DropdownMenuItem
                                    key={folder.id}
                                    onClick={() =>
                                      handleAssignToFolder(chat.id, folder.id)
                                    }
                                  >
                                    <FolderInput className="mr-2 size-4" />
                                    Move to {folder.name}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDeleteChat(chat.id)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter>
          <Separator className="mx-2" />

          {/* Login/User Button */}
          <div className="px-2 py-2 cursor-pointer">
            {isSignedIn ? (
              <div className="flex items-center justify-center">
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full skeuomorphic-button"
                >
                  <span className="cursor-pointer">Log in</span>
                </Button>
              </SignInButton>
            )}
          </div>

          <div className="text-muted-foreground px-2 py-2 text-center text-xs">
            Ask ProjectMap, Know More.
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main content area */}
      <SidebarInset>
        {/* <AppHeader /> */}
        {children}
      </SidebarInset>

      <Dialog
        open={isNewFolderDialogOpen}
        onOpenChange={setIsNewFolderDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="My Folder"
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    handleCreateFolder();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewFolderDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRenameFolderDialogOpen}
        onOpenChange={setIsRenameFolderDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>
              Enter a new name for this folder.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rename-folder">Folder Name</Label>
              <Input
                id="rename-folder"
                value={renameFolderName}
                onChange={e => setRenameFolderName(e.target.value)}
                placeholder="My Folder"
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    handleRenameFolder();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameFolderDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRenameFolder}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

export default AppSidebar;
