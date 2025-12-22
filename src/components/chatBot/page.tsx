"use client";

import React from "react";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ChatInterface } from "./ChatInterface";
import { Message as ChatMessage, Attachment } from "@/types/chat";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/contexts/ThemeContext";

interface LegacyMessage {
  id: number;
  type: "assistant" | "user";
  content: string;
  timestamp: string;
  isLoading?: boolean;
  responseTime?: number;
}

// Convert legacy message format to new format
function convertToChatMessage(msg: LegacyMessage): ChatMessage {
  return {
    id: msg.id.toString(),
    role: msg.type === "user" ? "user" : "assistant",
    content: msg.content,
    timestamp:
      typeof msg.timestamp === "string"
        ? new Date().getTime() // Fallback for string timestamps
        : (msg.timestamp as number),
  };
}

export default function ChatPage({
  selectedChatId,
  isNewChat,
}: {
  selectedChatId?: string | null;
  isNewChat?: boolean;
}) {
  const { user } = useUser();
  const createChat = useMutation(api.chats.createChat);
  const addMessage = useMutation(api.chats.addMessage);

  const [currentChatId, setCurrentChatId] = useState<Id<"chats"> | null>(null);
  const [isChatCreated, setIsChatCreated] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [hasMessages, setHasMessages] = useState(false);

  const currentChatMessages = useQuery(
    api.chats.getChatMessages,
    currentChatId ? { chatId: currentChatId } : "skip"
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (selectedChatId && selectedChatId !== currentChatId) {
      setCurrentChatId(selectedChatId as Id<"chats">);
      setIsChatCreated(true);
      setIsLoadingChat(true);
    }
  }, [selectedChatId, currentChatId]);

  useEffect(() => {
    if (isNewChat) {
      setCurrentChatId(null);
      setIsChatCreated(false);
      setIsLoadingChat(false);
      setMessages([]);
      setHasMessages(false);
    }
  }, [isNewChat]);

  useEffect(() => {
    if (currentChatMessages && currentChatMessages.length > 0) {
      const formattedMessages: ChatMessage[] = currentChatMessages.map(
        (msg) => {
          return {
            id: msg._id.toString(),
            role: msg.type === "user" ? "user" : "assistant",
            content: msg.content,
            timestamp: msg.timestamp,
          };
        }
      );
      setMessages(formattedMessages);
      setIsLoadingChat(false);
      setHasMessages(formattedMessages.length > 0);
    } else if (
      currentChatId &&
      currentChatMessages &&
      currentChatMessages.length === 0
    ) {
      setMessages([]);
      setIsLoadingChat(false);
      setHasMessages(false);
    }
  }, [currentChatMessages, currentChatId]);

  const handleSendMessage = useCallback(
    async (content: string, attachments?: Attachment[]) => {
      if (!content.trim() || isLoading) return;

      const startTime = Date.now();

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: Date.now(),
        attachments,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setIsAiThinking(true);
      setHasMessages(true);

      try {
        let chatId = currentChatId;

        if (user) {
          if (!isChatCreated && !currentChatId) {
            chatId = await createChat({
              userId: user.id,
              initialMessage: content,
            });
            setCurrentChatId(chatId);
            setIsChatCreated(true);
          } else if (chatId) {
            await addMessage({
              chatId,
              userId: user.id,
              content,
              type: "user",
            });
          }
        }

        const conversationHistory = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        const fullConversation = [
          ...conversationHistory,
          { role: "user" as const, content },
        ];

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
        const responseTime = endTime - startTime;

        setIsAiThinking(false);

        if (user && chatId) {
          await addMessage({
            chatId,
            userId: user.id,
            content: assistantContent,
            type: "assistant",
          });
        }

        const assistantMessage: ChatMessage & {
          timeTaken?: number;
          modelName?: string;
        } = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: assistantContent,
          timestamp: Date.now(),
          timeTaken: responseTime,
          modelName: "ProjectMap AI",
        };

        setMessages((prev) => [...prev, assistantMessage]);
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (error) {
        console.error("Error sending message:", error);

        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting. Please try again later.",
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, errorMessage]);
        setIsAiThinking(false);
        await new Promise((resolve) => setTimeout(resolve, 50));
      } finally {
        setIsLoading(false);
      }
    },
    [
      messages,
      isLoading,
      user,
      currentChatId,
      isChatCreated,
      createChat,
      addMessage,
    ]
  );

  return (
    <ThemeProvider>
      <Toaster position="top-right" />
      <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] bg-background overflow-hidden">
        <ChatInterface
          onSendMessage={handleSendMessage}
          messages={messages}
          isLoading={isLoading}
        />
      </div>
    </ThemeProvider>
  );
}
