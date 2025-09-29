"use client";

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
  FolderClosed,
  MessageSquare,
  Pin,
  Search,
  Sparkles,
} from "lucide-react";
import type * as React from "react";
import { AppHeader } from "@/components/header";

export function AppSidebar({ children }: { children: React.ReactNode }) {
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

          {/* New Chat */}
          <div className="p-2">
            <Button className="w-full" size="sm">
              <MessageSquare className="mr-2 size-4" />
              New Chat
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
          {/* Pinned */}
          <SidebarGroup>
            <SidebarGroupLabel>
              <Pin className="mr-2" />
              Pinned Chats
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="text-muted-foreground px-2 py-1 text-xs">
                No pinned chats
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Folders */}
          <SidebarGroup>
            <SidebarGroupLabel>
              <FolderClosed className="mr-2" />
              Folders
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="text-muted-foreground px-2 py-1 text-xs">
                No folders yet
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Today */}
          <SidebarGroup>
            <SidebarGroupLabel>Today</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <MessageSquare />
                    <span>New Chat</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <Separator className="mx-2" />
          <div className="text-muted-foreground px-2 py-2 text-center text-xs">
            Your Plan. Beautifully Mapped.
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main content area */}
      <SidebarInset>
        <AppHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AppSidebar;
