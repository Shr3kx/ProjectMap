"use client";

import React from "react";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { FolderKanban, Map, Users, Zap } from "lucide-react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import WorkflowDiagram from "../roadmap/page";

interface Message {
  id: number;
  type: "assistant" | "user";
  content: string;
  timestamp: string;
  isLoading?: boolean;
  responseTime?: number;
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

  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "assistant",
      content:
        "👋 Welcome to ProjectMap.io! I'm your AI assistant for creating beautiful project roadmaps. Tell me about your project and I'll help you turn your ideas into a clear, shareable roadmap.",
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    },
  ]);

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
      setMessages([
        {
          id: 1,
          type: "assistant",
          content:
            "👋 Welcome to ProjectMap.io! I'm your AI assistant for creating beautiful project roadmaps. Tell me about your project and I'll help you turn your ideas into a clear, shareable roadmap.",
          timestamp: getFormattedTime(),
        },
      ]);
      setHasMessages(false);
    }
  }, [isNewChat]);

  useEffect(() => {
    if (currentChatMessages && currentChatMessages.length > 0) {
      const formattedMessages = currentChatMessages.map((msg, index) => {
        // Compute a friendly timestamp
        const timestamp = new Date(msg.timestamp).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        // If this is an assistant message, try to compute response time
        // as the difference between this assistant timestamp and the most
        // recent previous user message timestamp (in seconds).
        let responseTime: number | undefined = undefined;
        if (msg.type === "assistant") {
          // Find the previous user message (search backwards)
          for (let j = index - 1; j >= 0; j--) {
            const prev = currentChatMessages[j];
            if (prev && prev.type === "user" && prev.timestamp) {
              const diffMs =
                (msg.timestamp as number) - (prev.timestamp as number);
              if (!Number.isNaN(diffMs) && diffMs >= 0) {
                responseTime = parseFloat((diffMs / 1000).toFixed(1));
              }
              break;
            }
          }
        }

        return {
          id: index + 1,
          type: msg.type as "user" | "assistant",
          content: msg.content,
          timestamp,
          responseTime,
        };
      });
      setMessages(formattedMessages);
      setIsLoadingChat(false);
      setHasMessages(formattedMessages.length > 1);
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
    async (userMessage: string) => {
      if (!userMessage.trim() || isLoading) return;

      const currentTime = getFormattedTime();
      const startTime = Date.now();

      const maxId = Math.max(0, ...messages.map(m => m.id));
      const newMessage: Message = {
        id: maxId + 1,
        type: "user",
        content: userMessage,
        timestamp: currentTime,
      };

      setMessages(prev => [...prev, newMessage]);
      setIsLoading(true);
      setIsAiThinking(true);
      setHasMessages(true);

      try {
        let chatId = currentChatId;

        if (user) {
          if (!isChatCreated && !currentChatId) {
            chatId = await createChat({
              userId: user.id,
              initialMessage: userMessage,
            });
            setCurrentChatId(chatId);
            setIsChatCreated(true);
          } else if (chatId) {
            await addMessage({
              chatId,
              userId: user.id,
              content: userMessage,
              type: "user",
            });
          }
        }

        const conversationHistory = messages
          .filter(msg => !msg.isLoading && msg.content.trim() !== "")
          .map(msg => ({
            role: msg.type === "user" ? "user" : "assistant",
            content: msg.content,
          }));

        const fullConversation = [
          ...conversationHistory,
          { role: "user", content: userMessage },
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
        const responseTime = ((endTime - startTime) / 1000).toFixed(1);

        setIsAiThinking(false);

        if (user && chatId) {
          await addMessage({
            chatId,
            userId: user.id,
            content: assistantContent,
            type: "assistant",
          });
        }

        const assistantMessage: Message = {
          id: maxId + 2,
          type: "assistant",
          content: assistantContent,
          timestamp: currentTime,
          responseTime: parseFloat(responseTime),
        };

        setMessages(prev => [...prev, assistantMessage]);
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error("Error sending message:", error);

        const errorMessage: Message = {
          id: maxId + 2,
          type: "assistant",
          content:
            "Sorry, I'm having trouble connecting. Please try again later.",
          timestamp: currentTime,
        };

        setMessages(prev => [...prev, errorMessage]);
        setIsAiThinking(false);
        await new Promise(resolve => setTimeout(resolve, 50));
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

  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
  }, []);

  const handleRegenerate = useCallback(
    async (messageId: number) => {
      const userMsg = messages.find(
        m => m.type === "user" && m.id === messageId - 1
      );
      if (userMsg) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
        await handleSendMessage(userMsg.content);
      }
    },
    [messages, handleSendMessage]
  );

  const handleDelete = useCallback((messageId: number) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  }, []);

  const quickStarters = [
    {
      icon: <FolderKanban className="w-4 h-4" />,
      text: "Build a SaaS MVP",
      category: "Startup",
    },
    {
      icon: <Map className="w-4 h-4" />,
      text: "Plan a hackathon project",
      category: "Event",
    },
    {
      icon: <Users className="w-4 h-4" />,
      text: "Open source roadmap",
      category: "Community",
    },
    {
      icon: <Zap className="w-4 h-4" />,
      text: "Mobile app launch",
      category: "Product",
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] bg-transparent overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 max-w-4xl">
          {/* Welcome Section - Hidden when messages exist */}
          {!hasMessages && (
            <>
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                  <FolderKanban className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden min-[475px]:inline">Ready to map your project?</span>
                  <span className="min-[475px]:hidden">Get Started</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
                  Turn your ideas into clear roadmaps
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
                  Perfect for indie developers, students, and small teams who want
                  beautiful, shareable project roadmaps without the complexity of
                  enterprise tools.
                </p>
              </div>

              {/* Quick Starters */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4 text-center">
                  Quick starters
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-2xl mx-auto">
                  {quickStarters.map((starter, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start h-auto p-3 sm:p-4 text-left bg-transparent hover:bg-accent/50 transition-colors"
                      onClick={() => handleSendMessage(starter.text)}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 w-full">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                          {starter.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground text-sm sm:text-base truncate">
                            {starter.text}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {starter.category}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Message List */}
          <MessageList
            messages={messages}
            isLoadingChat={isLoadingChat}
            isAiThinking={isAiThinking}
            onCopy={handleCopy}
            onRegenerate={handleRegenerate}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Chat Input - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 max-w-4xl py-3 sm:py-4">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Describe your project idea or ask for help with your roadmap..."
          />
        </div>
      </div>
    </div>
  );
}
