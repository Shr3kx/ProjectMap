"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import ThemeSwitcher from "@/components/theme-switcher";
import { Github } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import ChatPage from "@/components/chatBot/page";
export default function Page() {
  const router = useRouter();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isNewChat, setIsNewChat] = useState(false);

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setIsNewChat(false); // Clear new chat state when selecting existing chat
    // Navigate to the chat page with ID
    router.push(`/chat/${chatId}`);
  };

  const handleNewChat = () => {
    setSelectedChatId(null); // Clear selected chat
    setIsNewChat(true); // Set new chat state
    // Navigate to chat page
    router.push("/chat");
  };
  return (
    <SidebarProvider>
      <AppSidebar onChatSelect={handleChatSelect} onNewChat={handleNewChat} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="ml-auto flex items-center gap-2">
              <ThemeSwitcher />
              <Link href="https://github.com/Shr3kx" target="_blank">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label="GitHub"
                >
                  <Github className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <ChatPage selectedChatId={selectedChatId} isNewChat={isNewChat} />
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
