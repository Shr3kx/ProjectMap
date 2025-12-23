"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
  Trash2,
  Edit2,
  FolderInput,
  Command,
  ChevronsUpDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { SidebarState } from "@/lib/sidebar-types";
import {
  createFolder as createLocalFolder,
  renameFolder as renameLocalFolder,
  deleteFolder as deleteLocalFolder,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onChatSelect?: (chatId: string) => void;
  onNewChat?: () => void;
}

export function AppSidebar({
  onChatSelect,
  onNewChat,
  ...props
}: AppSidebarProps) {
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
      const formattedFolders = folders.map((folder) => ({
        id: folder._id as string,
        name: folder.name,
        createdAt: new Date((folder as any)._creationTime || Date.now()),
      }));

      const formattedChats = chats.map((chat) => ({
        id: chat._id as string,
        title: chat.title,
        folderId: (chat.folderId as string) || null,
        isPinned: chat.isPinned,
        createdAt: new Date(chat.createdAt),
      }));

      setState({
        folders: formattedFolders,
        chats: formattedChats,
      });
    }
  }, [isLoaded, isSignedIn, userId, folders, chats]);

  const handleCreateChat = () => {
    onNewChat?.();
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    setIsLoading(true);
    try {
      if (isSignedIn && userId) {
        await createConvexFolder({
          userId: userId,
          name: newFolderName.trim(),
        });
      } else {
        setState((prev) => createLocalFolder(prev, newFolderName.trim()));
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
        await updateConvexFolder({
          folderId: renameFolderId as any,
          name: renameFolderName.trim(),
        });
      } else {
        setState((prev) =>
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
        await deleteConvexFolder({
          folderId: folderId as any,
        });
      } else {
        setState((prev) => deleteLocalFolder(prev, folderId));
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
        const chat = state.chats.find((c) => c.id === chatId);
        if (chat) {
          await updateConvexChat({
            chatId: chatId as any,
            isPinned: !chat.isPinned,
          });
        }
      } else {
        setState((prev) => toggleLocalPinChat(prev, chatId));
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
        await updateConvexChat({
          chatId: chatId as any,
          folderId: folderId as any,
        });
      } else {
        setState((prev) => assignLocalChatToFolder(prev, chatId, folderId));
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
        await deleteConvexChat({
          chatId: chatId as any,
        });
      } else {
        setState((prev) => deleteLocalChat(prev, chatId));
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

  const pinnedChats =
    userId && pinnedChatsData
      ? pinnedChatsData.map((chat) => ({
          id: chat._id,
          title: chat.title,
          folderId: chat.folderId,
          isPinned: chat.isPinned,
          createdAt: new Date(chat.createdAt),
        }))
      : getPinnedChats(state.chats);

  const chatsByDate = getChatsByDate(state.chats);

  // Render chat menu item with dropdown
  const renderChatMenuItem = (chat: any, showPinOption: boolean = true) => (
    <SidebarMenuItem key={chat.id}>
      <SidebarMenuButton onClick={() => onChatSelect?.(chat.id)}>
        <MessageSquare className="size-4" />
        <span className="flex-1 truncate">{chat.title}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="hover:bg-accent rounded p-1"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {showPinOption && (
              <>
                <DropdownMenuItem onClick={() => handleTogglePin(chat.id)}>
                  {chat.isPinned ? (
                    <>
                      <PinOff className="mr-2 size-4" />
                      Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="mr-2 size-4" />
                      Pin
                    </>
                  )}
                </DropdownMenuItem>
                {state.folders.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    {state.folders.map((folder) => (
                      <DropdownMenuItem
                        key={folder.id}
                        onClick={() => handleAssignToFolder(chat.id, folder.id)}
                      >
                        <FolderInput className="mr-2 size-4" />
                        Move to {folder.name}
                      </DropdownMenuItem>
                    ))}
                    {chat.folderId && (
                      <DropdownMenuItem
                        onClick={() => handleAssignToFolder(chat.id, null)}
                      >
                        <FolderInput className="mr-2 size-4" />
                        Remove from folder
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                <DropdownMenuSeparator />
              </>
            )}
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
  );

  return (
    <>
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          {/* Brand - keeping the design pattern */}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="/">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Image
                      src="/logo.png"
                      alt="ProjectMap"
                      width={24}
                      height={24}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">ProjectMap</span>
                    <span className="truncate text-xs">AI Roadmap Builder</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* New Chat Button */}
          <div className="px-2 pb-2">
            <Button
              className="w-full skeuomorphic-button"
              size="sm"
              onClick={handleCreateChat}
            >
              <MessageSquare className="mr-2 size-4" />
              New Chat
            </Button>
          </div>

          {/* New Folder Button */}
          <div className="px-2 pb-2">
            <Button
              variant="outline"
              className="w-full"
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
          {/* Pinned Chats - using NavMain design pattern */}
          {pinnedChats.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>
                <Pin className="mr-2 size-4" />
                Pinned Chats
              </SidebarGroupLabel>
              <SidebarMenu>
                {pinnedChats.map((chat) => renderChatMenuItem(chat, true))}
              </SidebarMenu>
            </SidebarGroup>
          )}

          {/* Folders */}
          {state.folders.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>
                <FolderClosed className="mr-2 size-4" />
                Folders
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {state.folders.map((folder) => {
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
                                  onClick={(e) => e.stopPropagation()}
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
                            {folderChats.map((chat) => (
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
                                      <button
                                        className="hover:bg-accent rounded p-1"
                                        onClick={(e) => e.stopPropagation()}
                                      >
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

          {/* Chats by Date - using NavSecondary design pattern */}
          {chatsByDate.today.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Today</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chatsByDate.today.map((chat) => renderChatMenuItem(chat))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {chatsByDate.yesterday.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Yesterday</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chatsByDate.yesterday.map((chat) =>
                    renderChatMenuItem(chat)
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {chatsByDate.lastWeek.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Last 7 Days</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chatsByDate.lastWeek.map((chat) => renderChatMenuItem(chat))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {chatsByDate.older.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Older</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chatsByDate.older.map((chat) => renderChatMenuItem(chat))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter>
          {/* User - using NavUser design pattern */}
          <SidebarMenu>
            <SidebarMenuItem>
              {isSignedIn && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={user.imageUrl}
                          alt={
                            user.fullName ||
                            user.emailAddresses[0]?.emailAddress ||
                            "User"
                          }
                        />
                        <AvatarFallback className="rounded-lg">
                          {user.fullName?.[0] ||
                            user.emailAddresses[0]?.emailAddress?.[0] ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {user.fullName || "User"}
                        </span>
                        <span className="truncate text-xs">
                          {user.emailAddresses[0]?.emailAddress || ""}
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side="right"
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage
                            src={user.imageUrl}
                            alt={
                              user.fullName ||
                              user.emailAddresses[0]?.emailAddress ||
                              "User"
                            }
                          />
                          <AvatarFallback className="rounded-lg">
                            {user.fullName?.[0] ||
                              user.emailAddresses[0]?.emailAddress?.[0] ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-medium">
                            {user.fullName || "User"}
                          </span>
                          <span className="truncate text-xs">
                            {user.emailAddresses[0]?.emailAddress || ""}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="flex items-center justify-center p-2">
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <SignInButton mode="modal">
                  <SidebarMenuButton size="lg" className="w-full">
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                      <Command className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">Log in</span>
                      <span className="truncate text-xs">Get started</span>
                    </div>
                  </SidebarMenuButton>
                </SignInButton>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Dialogs */}
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
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="My Folder"
                onKeyDown={(e) => {
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
            <Button onClick={handleCreateFolder} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
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
                onChange={(e) => setRenameFolderName(e.target.value)}
                placeholder="My Folder"
                onKeyDown={(e) => {
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
            <Button onClick={handleRenameFolder} disabled={isLoading}>
              {isLoading ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
