"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Send,
  FolderKanban,
  Map,
  Users,
  Zap,
  Paperclip,
  Copy,
  RotateCw,
  Trash2,
} from "lucide-react";

export default function ChatPage() {
  const [message, setMessage] = useState("");

  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const [messages, setMessages] = useState<
    Array<{
      id: number;
      type: "assistant" | "user";
      content: string;
      timestamp: string;
      isLoading?: boolean;
      responseTime?: number;
    }>
  >([
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

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleNewChat = () => {
    console.log("[v0] New chat shortcut triggered");
    setMessages([
      {
        id: 1,
        type: "assistant",
        content:
          "👋 Welcome to ProjectMap.io! I'm your AI assistant for creating beautiful project roadmaps. Tell me about your project and I'll help you turn your ideas into a clear, shareable roadmap.",
        timestamp: getFormattedTime(),
      },
    ]);
    setMessage("");
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    const currentTime = getFormattedTime();
    const startTime = Date.now();
    const newMessage = {
      id: messages.length + 1,
      type: "user" as const,
      content: userMessage,
      timestamp: currentTime,
    };

    const loadingMessage = {
      id: messages.length + 2,
      type: "assistant" as const,
      content: "",
      timestamp: currentTime,
      isLoading: true,
    };

    setMessages(prev => [...prev, newMessage, loadingMessage]);
    setMessage("");
    setIsLoading(true);

    try {
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

      setMessages(prev =>
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
      setMessages(prev =>
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
    <div className="min-h-screen bg-background ">
      <div className="container mx-auto px-4 py-2 max-w-4xl">
        {/* Welcome Section */}
        {messages.length === 1 && (
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
        )}

        {/* Quick Starters */}
        {messages.length === 1 && (
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
                  onClick={() => setMessage(starter.text)}
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
        )}

        {/* Chat Messages */}
        <div className="space-y-6 mb-8">
          {messages.map((msg, index) => {
            const isWelcome = index === 0 && msg.type === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex ${
                  msg.type === "user"
                    ? "justify-end"
                    : isWelcome
                      ? "justify-center"
                      : "justify-start"
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
                    className={`p-4 ${
                      msg.type === "user"
                        ? "bg-primary text-primary-foreground ml-4 rounded-2xl"
                        : "bg-card response-card rounded-2xl"
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
                  {msg.type === "assistant" && !msg.isLoading && !isWelcome && (
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
                          onClick={async () => {
                            const userMsg = messages.find(
                              m => m.type === "user" && m.id === msg.id - 1
                            );
                            if (userMsg) {
                              setMessages(prev =>
                                prev.filter(m => m.id !== msg.id)
                              );
                              const currentTime = getFormattedTime();
                              const startTime = Date.now();
                              const loadingMessage = {
                                id: msg.id,
                                type: "assistant" as const,
                                content: "",
                                timestamp: currentTime,
                                isLoading: true,
                              };
                              setMessages(prev => [...prev, loadingMessage]);
                              setIsLoading(true);
                              try {
                                const response = await fetch("/api/chat", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    message: userMsg.content,
                                  }),
                                });
                                if (!response.ok) {
                                  throw new Error(
                                    "Failed to get response from AI"
                                  );
                                }
                                const data = await response.json();
                                const endTime = Date.now();
                                const responseTime = (
                                  (endTime - startTime) /
                                  1000
                                ).toFixed(1);
                                setMessages(prev =>
                                  prev.map(m =>
                                    m.isLoading && m.id === msg.id
                                      ? {
                                          ...m,
                                          content: data.reply,
                                          isLoading: false,
                                          responseTime:
                                            parseFloat(responseTime),
                                        }
                                      : m
                                  )
                                );
                              } catch (error) {
                                console.error(
                                  "Error regenerating message:",
                                  error
                                );
                                setMessages(prev =>
                                  prev.map(m =>
                                    m.isLoading && m.id === msg.id
                                      ? {
                                          ...m,
                                          content:
                                            "Sorry, I'm having trouble connecting. Please try again later.",
                                          isLoading: false,
                                        }
                                      : m
                                  )
                                );
                              } finally {
                                setIsLoading(false);
                              }
                            }
                          }}
                        >
                          <RotateCw className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-accent"
                          onClick={() => {
                            setMessages(prev =>
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
            );
          })}
        </div>

        {/* Input Area */}
        <Card className="p-4 bg-card border-border glass-card sticky bottom-4">
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={e => {
                console.log("[v0] File selected:", e.target.files?.[0]?.name);
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
                placeholder="Describe your project idea or ask for help with your roadmap..."
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
  );
}
