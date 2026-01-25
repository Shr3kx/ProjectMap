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
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [pinnedOpen, setPinnedOpen] = React.useState(true);
  const [foldersOpen, setFoldersOpen] = React.useState(true);
  
  // Check if user is logged in
  const { data: session, isPending: isSessionPending } = useSession();
  const isLoggedIn = !!session?.user;
  
  // Fetch conversations when logged in (skip if not logged in or session is still loading)
  const conversations = useQuery(
    api.chats.getUserConversations,
    !isSessionPending && isLoggedIn ? {} : "skip"
  );

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#" className="flex items-center gap-2">
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

        {/* Pinned Chats */}
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
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  No pinned chats
                </div>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Folders */}
        <SidebarGroup>
          <Collapsible open={foldersOpen} onOpenChange={setFoldersOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:text-foreground">
                <div className="flex items-center gap-2">
                  <Folder className="size-4" />
                  <span>Folders</span>
                </div>
                <ChevronUp
                  className={`size-4 transition-transform ${
                    foldersOpen ? "" : "rotate-180"
                  }`}
                />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  No folders yet
                </div>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Your Chats Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary">Your Chats</SidebarGroupLabel>
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
                ) : (
                  // Display chat names
                  conversations.map((conversation) => (
                    <SidebarMenuItem key={conversation.conversationId}>
                      <SidebarMenuButton className="bg-card" asChild>
                        <a href="#">
                          <MessageSquare className="size-4" />
                          <span className="truncate">{conversation.chatName || "New Chat"}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
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
  );
}
