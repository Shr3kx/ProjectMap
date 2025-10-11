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
import AppSidebar from "@/components/sidebar";
import MessageList from "@/components/chatBot/MessageList";
import ChatInput from "@/components/chatBot/ChatInput";

function ChatConversationPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const userId = user?.id;
  const router = useRouter();
  const params = useParams();
  const chatId = params.id as string;

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

  // Convex mutations
  const addConvexMessage = useMutation(api.chats.addMessage);

  // Convex queries
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

  // Load existing chat messages
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

      // Add user message and start AI thinking
      setLocalMessages(prev => [...prev, newMessage]);
      setIsLoading(true);
      setIsAiThinking(true);

      try {
        // Save message to Convex
        if (isSignedIn && userId && chatId) {
          await addConvexMessage({
            chatId: chatId as any,
            userId: userId,
            content: userMessage,
            type: "user",
          });
        }

        // Prepare conversation history for API call
        const conversationHistory = localMessages
          .filter(msg => !msg.isLoading && msg.content.trim() !== "") // Exclude loading and empty messages
          .map(msg => ({
            role: msg.type === "user" ? "user" : "assistant",
            content: msg.content
          }));

        // Add the new user message to the history
        const fullConversation = [
          ...conversationHistory,
          { role: "user", content: userMessage }
        ];

        // Make API call with full conversation history
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

        // Wait for complete response data - this ensures we have the full response
        const data = await response.json();
        
        // Validate response structure
        if (!data.reply || typeof data.reply !== 'string') {
          throw new Error("Invalid response: missing or invalid reply content");
        }

        const endTime = Date.now();
        const responseTime = ((endTime - startTime) / 1000).toFixed(1);

        // Save AI response to Convex
        if (isSignedIn && userId && chatId) {
          await addConvexMessage({
            chatId: chatId as any,
            userId: userId,
            content: data.reply,
            type: "assistant",
          });
        }

        // Add the assistant response message
        const assistantMessage = {
          id: localMessages.length + 2,
          type: "assistant" as const,
          content: data.reply,
          timestamp: currentTime,
          responseTime: parseFloat(responseTime),
        };

        setLocalMessages(prev => [...prev, assistantMessage]);

        // Stop AI thinking and small delay to ensure state update completes
        setIsAiThinking(false);
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.error("Error sending message:", error);
        
        // Add error message and stop AI thinking
        const errorMessage = {
          id: localMessages.length + 2,
          type: "assistant" as const,
          content: "Sorry, I'm having trouble connecting. Please try again later.",
          timestamp: currentTime,
        };

        setLocalMessages(prev => [...prev, errorMessage]);
        setIsAiThinking(false);

        // Small delay for error case as well
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } finally {
        // Clear the global loading state only after message state is updated
        setIsLoading(false);
      }
    }, [localMessages, isLoading, isSignedIn, userId, chatId, addConvexMessage]);

  // Optimized message handlers
  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
  }, []);

  const handleDelete = useCallback((messageId: number) => {
    setLocalMessages(prev => prev.filter(m => m.id !== messageId));
  }, []);

  if (!isLoaded) {
    return (
      <AppSidebar>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppSidebar>
    );
  }

  if (!chatData) {
    return (
      <AppSidebar>
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl font-bold mb-4">Chat not found</h1>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </AppSidebar>
    );
  }

  return (
    <AppSidebar>
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
    </AppSidebar>
  );
}

export default ChatConversationPage;
