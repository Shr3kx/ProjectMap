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

  // Query to load messages for the current chat
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

  // Handle chat selection from sidebar
  useEffect(() => {
    if (selectedChatId && selectedChatId !== currentChatId) {
      setCurrentChatId(selectedChatId as Id<"chats">);
      setIsChatCreated(true);
      setIsLoadingChat(true);
    }
  }, [selectedChatId, currentChatId]);

  // Handle new chat reset
  useEffect(() => {
    if (isNewChat) {
      // Reset all chat state to start fresh
      setCurrentChatId(null);
      setIsChatCreated(false);
      setIsLoadingChat(false);
      // Reset to welcome message
      setMessages([
        {
          id: 1,
          type: "assistant",
          content:
            "👋 Welcome to ProjectMap.io! I'm your AI assistant for creating beautiful project roadmaps. Tell me about your project and I'll help you turn your ideas into a clear, shareable roadmap.",
          timestamp: getFormattedTime(),
        },
      ]);
    }
  }, [isNewChat]);

  // Load messages when a chat is selected
  useEffect(() => {
    if (currentChatMessages && currentChatMessages.length > 0) {
      const formattedMessages = currentChatMessages.map((msg, index) => ({
        id: index + 1,
        type: msg.type as "user" | "assistant",
        content: msg.content,
        timestamp: new Date(msg.timestamp).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      }));
      setMessages(formattedMessages);
      setIsLoadingChat(false);
    } else if (
      currentChatId &&
      currentChatMessages &&
      currentChatMessages.length === 0
    ) {
      // Chat exists but has no messages, show empty state
      setMessages([]);
      setIsLoadingChat(false);
    }
  }, [currentChatMessages, currentChatId]);

  // Optimized message sending function
  const handleSendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isLoading) return;

      const currentTime = getFormattedTime();
      const startTime = Date.now();
      const newMessage: Message = {
        id: messages.length + 1,
        type: "user",
        content: userMessage,
        timestamp: currentTime,
      };

      const loadingMessage: Message = {
        id: messages.length + 2,
        type: "assistant",
        content: "",
        timestamp: currentTime,
        isLoading: true,
      };

      // Add both user message and loading assistant message
      setMessages(prev => [...prev, newMessage, loadingMessage]);
      setIsLoading(true);

      try {
        let chatId = currentChatId;

        // Only save to database if user is authenticated
        if (user) {
          // Create a new chat if this is the first message
          if (!isChatCreated && !currentChatId) {
            chatId = await createChat({
              userId: user.id,
              initialMessage: userMessage,
            });
            setCurrentChatId(chatId);
            setIsChatCreated(true);
          } else if (chatId) {
            // Add user message to existing chat
            await addMessage({
              chatId,
              userId: user.id,
              content: userMessage,
              type: "user",
            });
          }
        }

        // Make API call and wait for complete response
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        // Wait for complete response data
        const data = await response.json();
        
        // Validate response structure
        if (!data.reply) {
          throw new Error("Invalid response: missing reply content");
        }

        const endTime = Date.now();
        const responseTime = ((endTime - startTime) / 1000).toFixed(1);

        // Save AI response to database only if user is authenticated
        if (user && chatId) {
          await addMessage({
            chatId,
            userId: user.id,
            content: data.reply,
            type: "assistant",
          });
        }

        // Only update the loading message after we have the complete response
        setMessages(prev =>
          prev.map(msg =>
            msg.isLoading && msg.id === loadingMessage.id
              ? {
                  ...msg,
                  content: data.reply,
                  isLoading: false,
                  responseTime: parseFloat(responseTime),
                }
              : msg
          )
        );
      } catch (error) {
        console.error("Error sending message:", error);
        
        // Update loading message with error content
        setMessages(prev =>
          prev.map(msg =>
            msg.isLoading && msg.id === loadingMessage.id
              ? {
                  ...msg,
                  content:
                    "Sorry, I'm having trouble connecting. Please try again later.",
                  isLoading: false,
                }
              : msg
          )
        );
      } finally {
        // Always clear the global loading state
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

  // Optimized message handlers
  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
  }, []);

  const handleRegenerate = useCallback(
    async (messageId: number) => {
      // Find the user message that preceded this assistant message
      const userMsg = messages.find(
        m => m.type === "user" && m.id === messageId - 1
      );
      if (userMsg) {
        // Remove the assistant message and regenerate
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
    <div className="min-h-screen bg-transparent overflow-y-auto">
      <div className="container mx-auto px-4 py-2 max-w-4xl">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
            <FolderKanban className="w-4 h-4" />
            Ready to map your project?
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Turn your ideas into clear roadmaps
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Perfect for indie developers, students, and small teams who want
            beautiful, shareable project roadmaps without the complexity of
            enterprise tools.
          </p>
        </div>

        {/* Quick Starters */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">
            Quick starters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {quickStarters.map((starter, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto p-4 text-left bg-transparent"
                onClick={() => handleSendMessage(starter.text)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {starter.icon}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
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

        {/* Optimized Message List */}
        <MessageList
          messages={messages}
          isLoadingChat={isLoadingChat}
          onCopy={handleCopy}
          onRegenerate={handleRegenerate}
          onDelete={handleDelete}
        />

        {/* Optimized Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder="Describe your project idea or ask for help with your roadmap..."
        />
      </div>
    </div>
  );
}
