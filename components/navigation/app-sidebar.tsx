"use client";

import * as React from "react";
import { Brain, MessageSquarePlus, MessageSquare } from "lucide-react";
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

const demoChats = [
  { chatName: "Welcome to ProjectMap" },
  { chatName: "Sample conversation" },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
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
        <div className="px-2 py-2">
          <SidebarMenuButton size="sm" className="w-full skeuomorphic-button">
            <MessageSquarePlus className="size-4" />
            <span>New Chat</span>
          </SidebarMenuButton>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-primary">
            Your Chats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {demoChats.map(chat => (
                <ChatItem
                  key={chat.chatName}
                  chatName={chat.chatName}
                />
              ))}
              <SidebarMenuItem>
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  Sign-in and history are disabled while backend auth is removed.
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm text-muted-foreground">
            Tip
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="bg-card" asChild>
                  <a href="#">
                    <MessageSquare className="size-4" />
                    <span>Keep chatting — no login needed</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
