"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Map, Users, Zap } from "lucide-react";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "assistant",
      content:
        "👋 Welcome to ProjectMap.io! I'm your AI assistant for creating beautiful project roadmaps. Tell me about your project and I'll help you turn your ideas into a clear, shareable roadmap.",
      timestamp: "Just now",
    },
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: "user",
      content: message,
      timestamp: "Just now",
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: "assistant",
        content:
          "Great! Let me help you create a roadmap for that. I'll break this down into clear milestones and tasks. What's your target timeline?",
        timestamp: "Just now",
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickStarters = [
    {
      icon: <Sparkles className="w-4 h-4" />,
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-2 max-w-4xl">
        {/* Welcome Section */}
        {messages.length === 1 && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
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
                    isWelcome ? "w-full max-w-2xl" : "max-w-[80%]"
                  } ${msg.type === "user" ? "order-2" : "order-1"}`}
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
                        ? "bg-primary text-primary-foreground ml-4"
                        : "bg-card border-border"
                    }`}
                  >
                    <p
                      className={`text-sm leading-relaxed ${
                        msg.type === "user"
                          ? "text-primary-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {msg.content}
                    </p>
                  </Card>
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
        <Card className="p-4 bg-card border-border sticky bottom-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Describe your project idea or ask for help with your roadmap..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="border-input bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Press Enter to send, Shift + Enter for new line
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              AI Assistant Ready
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
