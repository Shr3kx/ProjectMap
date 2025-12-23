"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Github } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import ThemeSwitcher from "@/components/theme-switcher";
import { ChatInterface } from "@/components/chatBot/ChatInterface";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Message, Attachment } from "@/types/chat";
import type { Id } from "../../../convex/_generated/dataModel";

export default function ChatPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const userId = user?.id;
  const router = useRouter();

  const handleChatSelect = (selectedChatId: string) => {
    router.push(`/chat/${selectedChatId}`);
  };

  const handleNewChat = () => {
    router.push("/chat");
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<Id<"chats"> | null>(null);

  const createChat = useMutation(api.chats.createChat);
  const addMessage = useMutation(api.chats.addMessage);

  const handleSendMessage = useCallback(
    async (content: string, attachments?: Attachment[]) => {
      if ((!content.trim() && !attachments?.length) || isLoading) return;

      const startTime = Date.now();
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: Date.now(),
        attachments,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        let activeChatId = currentChatId;

        // Create chat if it doesn't exist
        if (!activeChatId && isSignedIn && userId) {
          activeChatId = await createChat({
            userId: userId,
            initialMessage: content,
          });
          setCurrentChatId(activeChatId);
          // Navigate to the new chat
          router.push(`/chat/${activeChatId}`);
        }

        // Save user message to database
        if (isSignedIn && userId && activeChatId) {
          await addMessage({
            chatId: activeChatId,
            userId: userId,
            content,
            type: "user",
          });
        }

        // Prepare conversation history
        const conversationHistory = messages
          .filter((msg) => msg.content.trim() !== "")
          .map((msg) => ({
            role: msg.role,
            content: msg.content,
          }));

        const fullConversation = [
          ...conversationHistory,
          { role: "user" as const, content },
        ];

        // Call AI API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: fullConversation }),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            assistantContent += chunk;
          }
        }

        // Save AI response to database
        if (isSignedIn && userId && activeChatId) {
          await addMessage({
            chatId: activeChatId,
            userId: userId,
            content: assistantContent,
            type: "assistant",
          });
        }

        // Add assistant message
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: assistantContent,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (error) {
        console.error("Error sending message:", error);

        const errorMessage: Message = {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting. Please try again later.",
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, errorMessage]);
        await new Promise((resolve) => setTimeout(resolve, 50));
      } finally {
        setIsLoading(false);
      }
    },
    [
      messages,
      isLoading,
      isSignedIn,
      userId,
      currentChatId,
      createChat,
      addMessage,
      router,
    ]
  );

  if (!isLoaded) {
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
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-background relative">
          <ThemeProvider>
            <ChatInterface
              onSendMessage={handleSendMessage}
              messages={messages}
              isLoading={isLoading}
            />
          </ThemeProvider>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
