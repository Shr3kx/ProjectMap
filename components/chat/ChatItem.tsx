"use client";

import { MessageSquare } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

interface ChatItemProps {
  chatName: string;
}

export function ChatItem({ chatName }: ChatItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton className="flex-1 bg-card" asChild>
        <a href="#">
          <MessageSquare className="size-4" />
          <span className="truncate">{chatName}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
