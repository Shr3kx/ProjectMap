"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import MessageList from "@/components/chatBot/MessageList";
import ChatInput from "@/components/chatBot/ChatInput";

function ChatConversationPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const userId = user?.id;
  const router = useRouter();
  const params = useParams();
  const chatId = params.id as string;

  const handleChatSelect = (selectedChatId: string) => {
    router.push(`/chat/${selectedChatId}`);
  };

  const handleNewChat = () => {
    router.push("/");
  };

  const [localMessages, setLocalMessages] = useState<
    Array<{
      id: number;
      type: "assistant" | "user";
      content: string;
      timestamp: string;
      isLoading?: boolean;
      responseTime?: number;
    }>
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const addConvexMessage = useMutation(api.chats.addMessage);

  const chatData = useQuery(
    api.chats.getChat,
    chatId ? { chatId: chatId as any } : "skip"
  );

  const chatMessages = useQuery(
    api.chats.getChatMessages,
    chatId ? { chatId: chatId as any } : "skip"
  );

  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    if (!isLoaded || !chatMessages) return;

    const formattedMessages = chatMessages.map((msg, index) => ({
      id: index + 1,
      type: msg.type as "assistant" | "user",
      content: msg.content,
      timestamp: new Date(msg.timestamp).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    }));

    setLocalMessages(formattedMessages);
  }, [isLoaded, chatMessages]);

  const handleSendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isLoading) return;

      const currentTime = getFormattedTime();
      const startTime = Date.now();
      const newMessage = {
        id: localMessages.length + 1,
        type: "user" as const,
        content: userMessage,
        timestamp: currentTime,
      };

      // Add user message and start AI thinking indicator
      setLocalMessages((prev) => [...prev, newMessage]);
      setIsLoading(true);
      setIsAiThinking(true);

      try {
        // Save user message to database
        if (isSignedIn && userId && chatId) {
          await addConvexMessage({
            chatId: chatId as any,
            userId: userId,
            content: userMessage,
            type: "user",
          });
        }

        /**
         * Prepare conversation history for AI SDK
         * Filters out loading/empty messages and formats for API
         */
        const conversationHistory = localMessages
          .filter((msg) => !msg.isLoading && msg.content.trim() !== "")
          .map((msg) => ({
            role: msg.type === "user" ? "user" : "assistant",
            content: msg.content,
          }));

        const fullConversation = [
          ...conversationHistory,
          { role: "user", content: userMessage },
        ];

        /**
         * Stream response from AI SDK endpoint
         * The API uses Vercel AI SDK's streamText for efficient streaming
         */
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

        /**
         * Handle streaming response
         * Process the text stream in real-time
         */
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

        const endTime = Date.now();
        const responseTime = ((endTime - startTime) / 1000).toFixed(1);

        // Stop AI thinking indicator
        setIsAiThinking(false);

        // Save AI response to database
        if (isSignedIn && userId && chatId) {
          await addConvexMessage({
            chatId: chatId as any,
            userId: userId,
            content: assistantContent,
            type: "assistant",
          });
        }

        // Add the complete assistant response to messages
        const assistantMessage = {
          id: localMessages.length + 2,
          type: "assistant" as const,
          content: assistantContent,
          timestamp: currentTime,
          responseTime: parseFloat(responseTime),
        };

        setLocalMessages((prev) => [...prev, assistantMessage]);
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (error) {
        console.error("Error sending message:", error);

        // Show error message to user
        const errorMessage = {
          id: localMessages.length + 2,
          type: "assistant" as const,
          content:
            "Sorry, I'm having trouble connecting. Please try again later.",
          timestamp: currentTime,
        };

        setLocalMessages((prev) => [...prev, errorMessage]);
        setIsAiThinking(false);
        await new Promise((resolve) => setTimeout(resolve, 50));
      } finally {
        setIsLoading(false);
      }
    },
    [localMessages, isLoading, isSignedIn, userId, chatId, addConvexMessage]
  );

  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
  }, []);

  const handleDelete = useCallback((messageId: number) => {
    setLocalMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  if (!isLoaded) {
    return (
      <SidebarProvider>
        <AppSidebar onChatSelect={handleChatSelect} onNewChat={handleNewChat} />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!chatData) {
    return (
      <SidebarProvider>
        <AppSidebar onChatSelect={handleChatSelect} onNewChat={handleNewChat} />
        <SidebarInset>
          <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">
              <div className="loading">
                <svg width="64px" height="48px">
                  <polyline
                    points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
                    id="back"
                  ></polyline>
                  <polyline
                    points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
                    id="front"
                  ></polyline>
                </svg>
              </div>
            </h1>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar onChatSelect={handleChatSelect} onNewChat={handleNewChat} />
      <SidebarInset>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-2 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 p-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">
                  {chatData?.title || "Chat"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {chatMessages?.length || 0} messages
                </p>
              </div>
            </div>

            {/* Loading state */}
            {isLoaded && chatId && !chatMessages && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {/* Optimized Message List */}
            <MessageList
              messages={localMessages}
              isLoadingChat={false}
              isAiThinking={isAiThinking}
              onCopy={handleCopy}
              onDelete={handleDelete}
            />

            {/* Optimized Chat Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder="Continue the conversation..."
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default ChatConversationPage;
