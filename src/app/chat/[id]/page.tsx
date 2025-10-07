"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Send,
  Map,
  Paperclip,
  Copy,
  RotateCw,
  Trash2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AppSidebar from "@/components/sidebar";

function ChatConversationPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const userId = user?.id;
  const router = useRouter();
  const params = useParams();
  const chatId = params.id as string;

  const [message, setMessage] = useState("");
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

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    const currentTime = getFormattedTime();
    const startTime = Date.now();
    const newMessage = {
      id: localMessages.length + 1,
      type: "user" as const,
      content: userMessage,
      timestamp: currentTime,
    };

    const loadingMessage = {
      id: localMessages.length + 2,
      type: "assistant" as const,
      content: "",
      timestamp: currentTime,
      isLoading: true,
    };

    setLocalMessages(prev => [...prev, newMessage, loadingMessage]);
    setMessage("");
    setIsLoading(true);

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

      // Get AI response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
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

      setLocalMessages(prev =>
        prev.map(msg =>
          msg.isLoading
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
      setLocalMessages(prev =>
        prev.map(msg =>
          msg.isLoading
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
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
              <h1 className="text-xl font-semibold">{chatData?.title || "Chat"}</h1>
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

          {/* Chat Messages */}
          <div className="space-y-6 mb-8">
            {localMessages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`${
                    msg.type === "user" ? "max-w-[80%]" : "w-full max-w-2xl"
                  } ${
                    msg.type === "user" ? "order-2" : "order-1"
                  } flex flex-col`}
                >
                  {msg.type === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Map className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        ProjectMap AI
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}
                  <Card
                    className={`p-4 rounded-2xl ${
                      msg.type === "user"
                        ? "bg-primary text-primary-foreground ml-4"
                        : `bg-card response-card`
                    }`}
                  >
                    {msg.isLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                        <span>ProjectMap is thinking...</span>
                      </div>
                    ) : (
                      <p
                        className={`text-sm leading-relaxed ${
                          msg.type === "user"
                            ? "text-primary-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {msg.content}
                      </p>
                    )}
                  </Card>
                  {msg.type === "assistant" && !msg.isLoading && (
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>ProjectMap</span>
                        <span>•</span>
                        <span>Responded in {msg.responseTime || 0}s</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-accent"
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-accent"
                          onClick={() => {
                            setLocalMessages(prev =>
                              prev.filter(m => m.id !== msg.id)
                            );
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {msg.type === "user" && (
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {msg.timestamp}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        You
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <Card className="p-4 bg-card border-border glass-card sticky bottom-4">
            <div className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={e => {
                  console.log("File selected:", e.target.files?.[0]?.name);
                }}
              />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 bg-transparent"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <div className="flex-1">
                <Input
                  ref={inputRef}
                  placeholder="Continue the conversation..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Press Enter to send, Shift + Enter for new line
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                {isLoading ? "AI is typing..." : "AI Assistant Ready"}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppSidebar>
  );
}

export default ChatConversationPage;
