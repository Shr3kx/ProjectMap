"use client";

import * as React from "react";
import {
  Brain,
  MessageSquarePlus,
  Search,
  Pin,
  ChevronUp,
  Folder,
  MessageSquare,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth-client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChatItem } from "@/components/chat/ChatItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import type { Id } from "@/convex/_generated/dataModel";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [pinnedOpen, setPinnedOpen] = React.useState(true);
  const [foldersOpen, setFoldersOpen] = React.useState(true);
  const [newFolderName, setNewFolderName] = React.useState("");
  const [isCreatingFolder, setIsCreatingFolder] = React.useState(false);
  const [showFolderInput, setShowFolderInput] = React.useState(false);
  const [deleteFolderModal, setDeleteFolderModal] = React.useState<{
    folderId: Id<"folders">;
    folderName: string;
  } | null>(null);
  const [isDeletingFolder, setIsDeletingFolder] = React.useState(false);

  // Check if user is logged in
  const { data: session, isPending: isSessionPending } = useSession();
  const isLoggedIn = !!session?.user;

  // Fetch conversations when logged in (skip if not logged in or session is still loading)
  const conversations = useQuery(
    api.chats.getUserConversations,
    !isSessionPending && isLoggedIn ? {} : "skip",
  );

  // Fetch folders when logged in
  const folders = useQuery(
    api.folders.getUserFolders,
    !isSessionPending && isLoggedIn ? {} : "skip",
  );

  const createFolder = useMutation(api.folders.createFolder);
  const deleteFolder = useMutation(api.folders.deleteFolder);

  // Organize conversations
  const organizedChats = React.useMemo(() => {
    if (!conversations) return { pinned: [], inFolders: {}, remaining: [] };

    const pinned: typeof conversations = [];
    const inFolders: Record<string, typeof conversations> = {};
    const remaining: typeof conversations = [];

    conversations.forEach(conv => {
      if (conv.isPinned) {
        pinned.push(conv);
      } else if (conv.folderId) {
        const folderId = conv.folderId;
        if (!inFolders[folderId]) {
          inFolders[folderId] = [];
        }
        inFolders[folderId].push(conv);
      } else {
        remaining.push(conv);
      }
    });

    // Sort remaining by timestamp
    remaining.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);

    return { pinned, inFolders, remaining };
  }, [conversations]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name cannot be empty");
      return;
    }

    setIsCreatingFolder(true);
    try {
      await createFolder({ name: newFolderName.trim() });
      setNewFolderName("");
      setShowFolderInput(false);
      toast.success("Folder created");
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast.error("Failed to create folder");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleDeleteFolderClick = (
    folderId: Id<"folders">,
    folderName: string,
  ) => {
    setDeleteFolderModal({ folderId, folderName });
  };

  const handleDeleteFolderConfirm = async () => {
    if (!deleteFolderModal) return;
    setIsDeletingFolder(true);
    try {
      await deleteFolder({ folderId: deleteFolderModal.folderId });
      toast.success("Folder deleted");
    } catch (error) {
      console.error("Failed to delete folder:", error);
      toast.error("Failed to delete folder");
      throw error;
    } finally {
      setIsDeletingFolder(false);
    }
  };

  const refreshData = () => {
    // This will trigger a refetch of conversations and folders
    // The useQuery hooks will automatically refetch when mutations complete
  };

  return (
    <>
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
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
          {/* New Chat Button */}
          <div className="px-2 py-2">
            <SidebarMenuButton size="sm" className="w-full skeuomorphic-button">
              <MessageSquarePlus className="size-4" />
              <span>New Chat</span>
            </SidebarMenuButton>
          </div>

          {/* Search Bar */}
          <div className="px-2 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-foreground/70" />
              <Input
                type="search"
                placeholder="Search your chats..."
                className="pl-9 bg-card/20 text-foreground/70 border border-foreground/10 hover:bg-card/30 hover:text-foreground/90 focus:text-foreground placeholder:text-foreground/50 transition-colors"
              />
            </div>
          </div>

          {/* Pinned Chats - Only show when logged in */}
          {isLoggedIn && (
            <SidebarGroup>
              <Collapsible open={pinnedOpen} onOpenChange={setPinnedOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:text-foreground">
                    <div className="flex items-center gap-2">
                      <Pin className="size-4" />
                      <span>Pinned Chats</span>
                    </div>
                    <ChevronUp
                      className={`size-4 transition-transform ${
                        pinnedOpen ? "" : "rotate-180"
                      }`}
                    />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    {conversations === undefined ? (
                      <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : organizedChats.pinned.length === 0 ? (
                      <div className="px-2 py-2 text-sm text-muted-foreground">
                        No pinned chats
                      </div>
                    ) : (
                      <SidebarMenu>
                        {organizedChats.pinned.map(conv => (
                          <ChatItem
                            key={conv.conversationId}
                            conversationId={conv.conversationId}
                            chatName={conv.chatName || "New Chat"}
                            isPinned={conv.isPinned || false}
                            folderId={conv.folderId}
                            folders={folders || []}
                            onFolderChange={refreshData}
                          />
                        ))}
                      </SidebarMenu>
                    )}
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          )}

          {/* Folders - Only show when logged in */}
          {isLoggedIn && (
            <SidebarGroup>
              <Collapsible open={foldersOpen} onOpenChange={setFoldersOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:text-foreground">
                    <div className="flex items-center gap-2">
                      <Folder className="size-4" />
                      <span>Folders</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {foldersOpen && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setShowFolderInput(true);
                          }}
                          className="p-1 rounded hover:bg-accent"
                          title="Create folder"
                        >
                          <Plus className="size-3" />
                        </button>
                      )}
                      <ChevronUp
                        className={`size-4 transition-transform ${
                          foldersOpen ? "" : "rotate-180"
                        }`}
                      />
                    </div>
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    {showFolderInput ? (
                      <div className="px-2 py-2">
                        <Input
                          placeholder="Folder name"
                          value={newFolderName}
                          onChange={e => setNewFolderName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              handleCreateFolder();
                            } else if (e.key === "Escape") {
                              setShowFolderInput(false);
                              setNewFolderName("");
                            }
                          }}
                          autoFocus
                          className="mb-2"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleCreateFolder}
                            disabled={isCreatingFolder}
                            className="flex-1 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                          >
                            {isCreatingFolder ? (
                              <Loader2 className="size-4 animate-spin mx-auto" />
                            ) : (
                              "Create"
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowFolderInput(false);
                              setNewFolderName("");
                            }}
                            disabled={isCreatingFolder}
                            className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-accent disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : folders === undefined ? (
                      <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : folders.length === 0 ? (
                      <div className="px-2 py-2 text-sm text-muted-foreground">
                        No folders yet
                      </div>
                    ) : (
                      folders.map(folder => {
                        const folderChats =
                          organizedChats.inFolders[folder._id] || [];
                        return (
                          <div key={folder._id} className="mb-2">
                            <div className="flex items-center justify-between px-2 py-1 group">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Folder className="size-4" />
                                <span>{folder.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({folderChats.length})
                                </span>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-accent transition-opacity"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <Trash2 className="size-3" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteFolderClick(
                                        folder._id,
                                        folder.name,
                                      )
                                    }
                                    variant="destructive"
                                  >
                                    <Trash2 className="size-4" />
                                    <span>Delete folder</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            {folderChats.length > 0 && (
                              <SidebarMenu className="ml-4">
                                {folderChats.map(conv => (
                                  <ChatItem
                                    key={conv.conversationId}
                                    conversationId={conv.conversationId}
                                    chatName={conv.chatName || "New Chat"}
                                    isPinned={conv.isPinned || false}
                                    folderId={conv.folderId}
                                    folders={folders}
                                    onFolderChange={refreshData}
                                  />
                                ))}
                              </SidebarMenu>
                            )}
                          </div>
                        );
                      })
                    )}
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          )}

          {/* Your Chats Section */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-primary">
              Your Chats
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isLoggedIn ? (
                  // Show conversations when logged in
                  conversations === undefined ? (
                    // Loading state
                    <SidebarMenuItem>
                      <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        <span>Loading chats...</span>
                      </div>
                    </SidebarMenuItem>
                  ) : conversations.length === 0 ? (
                    // No chats yet
                    <SidebarMenuItem>
                      <div className="px-2 py-2 text-sm text-muted-foreground">
                        No chats yet
                      </div>
                    </SidebarMenuItem>
                  ) : organizedChats.remaining.length === 0 ? (
                    // No remaining chats
                    <SidebarMenuItem>
                      <div className="px-2 py-2 text-sm text-muted-foreground">
                        No chats yet
                      </div>
                    </SidebarMenuItem>
                  ) : (
                    // Display remaining chat names (not pinned, not in folders)
                    organizedChats.remaining.map(conversation => (
                      <ChatItem
                        key={conversation.conversationId}
                        conversationId={conversation.conversationId}
                        chatName={conversation.chatName || "New Chat"}
                        isPinned={conversation.isPinned || false}
                        folderId={conversation.folderId}
                        folders={folders || []}
                        onFolderChange={refreshData}
                      />
                    ))
                  )
                ) : (
                  // Show "New Chat" when not logged in
                  <SidebarMenuItem>
                    <SidebarMenuButton className="bg-card" asChild>
                      <a href="#">
                        <MessageSquare className="size-4" />
                        <span>New Chat</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <ConfirmDeleteModal
        open={!!deleteFolderModal}
        onOpenChange={open => {
          if (!open) setDeleteFolderModal(null);
        }}
        title="Delete folder"
        description={
          deleteFolderModal
            ? `Are you sure you want to delete the folder "${deleteFolderModal.folderName}"? Chats inside will be unassigned but not deleted.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteFolderConfirm}
        isLoading={isDeletingFolder}
      />
    </>
  );
}
