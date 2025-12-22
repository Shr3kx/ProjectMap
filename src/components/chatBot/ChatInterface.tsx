"use client";

import React, { useState, useEffect, useRef } from "react";
import { Message, Attachment } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { InputArea } from "./InputArea";
import toast from "react-hot-toast";
import {
  Loader2,
  Map,
  MessageSquare,
  Wand2,
  Code,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTheme } from "@/contexts/ThemeContext";

interface MessageWithMetadata extends Message {
  modelName?: string;
  timeTaken?: number;
}

const categories = [
  { id: "general", label: "Idea → Project" },
  { id: "learning", label: "Learning Roadmaps" },
  { id: "creative", label: "Product & Startup" },
  { id: "coding", label: "Engineering & Tech" },
];

const allSamplePrompts = {
  general: [
    "I have an idea for a task management app. Create a step-by-step roadmap from idea validation to MVP.",
    "Turn a vague project idea into a clear roadmap with milestones and deliverables.",
    "Create a 30-day execution roadmap for building a side project.",
    "Break down an idea into research, planning, building, and launch phases.",
    "Generate a roadmap to go from zero to a portfolio-ready project.",
    "Help me plan a project roadmap when I don’t know where to start.",
    "Create a roadmap to validate an idea before investing time in development.",
    "Convert my idea into a realistic, time-bound project plan.",
  ],

  learning: [
    "Create a beginner-to-job-ready roadmap for frontend development.",
    "Generate a 6-month learning roadmap for full-stack web development.",
    "Create a step-by-step roadmap to learn Java from scratch.",
    "Build a roadmap to prepare for software engineering interviews.",
    "Generate a daily learning roadmap for the next 30 days.",
    "Create a roadmap to learn data structures and algorithms effectively.",
    "Plan a learning roadmap to transition from frontend to backend development.",
    "Create a structured roadmap to learn AI and machine learning.",
  ],

  creative: [
    "Create a product roadmap to build and launch a SaaS application.",
    "Generate a startup roadmap from idea to first paying users.",
    "Break down a product idea into MVP, v1, and growth phases.",
    "Create a roadmap to validate product-market fit.",
    "Generate a roadmap for launching an app with limited resources.",
    "Plan a roadmap for turning a side project into a startup.",
    "Create a product roadmap with feature prioritization and timelines.",
    "Generate a roadmap for building and launching a no-code MVP.",
  ],

  coding: [
    "Create a technical roadmap for building a Next.js + Supabase project.",
    "Generate an engineering roadmap for a scalable React application.",
    "Break down the technical steps to build a full-stack web app.",
    "Create a roadmap for integrating AI APIs into a web product.",
    "Generate a roadmap for implementing authentication and authorization.",
    "Create a roadmap to improve and refactor an existing codebase.",
    "Plan the engineering roadmap for building a dashboard application.",
    "Generate a roadmap for setting up clean architecture and project structure.",
  ],
};

function getRandomPrompts(array: string[], count: number): string[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

interface EmptyStateProps {
  onPromptClick: (prompt: string) => void;
}

const EmptyState = ({ onPromptClick }: EmptyStateProps) => {
  const [activeTab, setActiveTab] = React.useState("general");
  const [currentPrompts, setCurrentPrompts] = React.useState<
    Record<string, string[]>
  >({});

  React.useEffect(() => {
    // Initialize random prompts for each category
    const initialPrompts: Record<string, string[]> = {};
    Object.entries(allSamplePrompts).forEach(([category, prompts]) => {
      initialPrompts[category] = getRandomPrompts(prompts, 3);
    });
    setCurrentPrompts(initialPrompts);
  }, []);

  const tabIcons = {
    general: <Sparkles className="w-4 h-4" />,
    creative: <Wand2 className="w-4 h-4" />,
    learning: <GraduationCap className="w-4 h-4" />,
    coding: <Code className="w-4 h-4" />,
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto px-3 sm:px-4 md:px-6 text-left pt-8 sm:pt-12">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Hey, how can I help you today?
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
          ProjectMap turns your ideas into structured roadmaps. No ads. No
          fluff. Just steps.
        </p>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`flex items-center rounded-md gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                activeTab === category.id
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground bg-foreground/5 border border-foreground/10 hover:bg-foreground/10"
              }`}
            >
              {tabIcons[category.id as keyof typeof tabIcons]}
              {category.label}
            </button>
          ))}
        </div>

        <div className="w-full">
          {Object.entries(currentPrompts).map(([category, prompts]) => (
            <div
              key={category}
              className={`space-y-2 ${
                activeTab === category ? "block" : "hidden"
              }`}
            >
              {prompts.map((prompt, i) => (
                <button
                  key={i}
                  className="flex w-full justify-start px-3 sm:px-4 py-3 sm:py-4 h-auto text-left hover:bg-foreground/8 transition-colors duration-200 rounded-lg border border-foreground/10 bg-card/20 text-foreground/70 hover:text-foreground/90"
                  onClick={() => onPromptClick(prompt)}
                >
                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-1" />
                  <span className="text-xs sm:text-sm leading-relaxed">
                    {prompt}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export function ChatInterface({
  onSendMessage: externalOnSendMessage,
  messages: externalMessages,
  isLoading: externalIsLoading,
}: {
  onSendMessage?: (
    content: string,
    attachments?: Attachment[]
  ) => Promise<void>;
  messages?: Message[];
  isLoading?: boolean;
}) {
  const [messages, setMessages] = useState<MessageWithMetadata[]>(
    externalMessages || []
  );
  const [isLoading, setIsLoading] = useState(externalIsLoading || false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const requestStartTime = useRef<number>(0);
  const inputAreaRef = useRef<{
    openFileDialog: () => void;
    setInputValue: (value: string) => void;
    focusInput: () => void;
  } | null>(null);
  const { cycleTheme } = useTheme();

  // Sync with external messages if provided
  useEffect(() => {
    if (externalMessages) {
      setMessages(externalMessages as MessageWithMetadata[]);
    }
  }, [externalMessages]);

  useEffect(() => {
    if (externalIsLoading !== undefined) {
      setIsLoading(externalIsLoading);
    }
  }, [externalIsLoading]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: "/",
        ctrlKey: true,
        callback: () => {
          cycleTheme();
        },
        description: "Cycle to next theme",
      },
      {
        key: "a",
        ctrlKey: true,
        shiftKey: true,
        callback: () => {
          if (inputAreaRef.current) {
            inputAreaRef.current.openFileDialog();
          }
        },
        description: "Open file attachment dialog",
      },
    ],
    enabled: true,
  });

  const handleSendMessage = async (
    content: string,
    attachments?: Attachment[]
  ) => {
    if (!content.trim() && !attachments?.length) return;

    // Add user message
    const userMessage: MessageWithMetadata = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: Date.now(),
      attachments,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    requestStartTime.current = Date.now();

    try {
      if (externalOnSendMessage) {
        await externalOnSendMessage(content, attachments);
        // The parent component will handle the response and update messages
      } else {
        // Fallback: call API directly if no external handler
        const requestBody = {
          messages: [
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            {
              role: "user",
              content,
            },
          ],
        };

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to get response");
        }

        const data = await response.json();

        const timeTaken = Date.now() - requestStartTime.current;

        const assistantMessage: MessageWithMetadata = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.content,
          timestamp: Date.now(),
          modelName: "ProjectMap AI",
          timeTaken: timeTaken,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMessage = (messageId: string, content: string) => {
    if (inputAreaRef.current) {
      inputAreaRef.current.setInputValue(content);
      inputAreaRef.current.focusInput();
    }

    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex !== -1) {
      setMessages(messages.slice(0, messageIndex));
    }
  };

  const handleRegenerateResponse = async (messageId: string) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex < 0 || messages[userMessageIndex].role !== "user") {
      toast.error("Cannot regenerate: no previous user message found");
      return;
    }

    const userMessage = messages[userMessageIndex];
    setMessages(messages.slice(0, messageIndex));
    await handleSendMessage(userMessage.content, userMessage.attachments);
  };

  const handleExportMessageToPDF = (messageId: string) => {
    toast.success("PDF export feature coming soon!");
  };

  const handleExportFullConversation = () => {
    if (messages.length === 0) {
      toast.error("No messages to export");
      return;
    }
    toast.success("PDF export feature coming soon!");
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto ${
          messages.length === 0 ? "flex items-center justify-center" : "pt-4"
        } pb-4 sm:pb-6`}
      >
        {messages.length === 0 ? (
          <EmptyState onPromptClick={handleSendMessage} />
        ) : (
          <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 space-y-1">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                modelName={message.modelName || "ProjectMap AI"}
                timeTaken={message.timeTaken}
                onEdit={message.role === "user" ? handleEditMessage : undefined}
                onRegenerate={
                  message.role === "assistant"
                    ? handleRegenerateResponse
                    : undefined
                }
                onExportPDF={
                  message.role === "assistant"
                    ? handleExportMessageToPDF
                    : undefined
                }
              />
            ))}

            {isLoading && (
              <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Map size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <div className="flex-1 max-w-[85%] sm:max-w-[80%]">
                  <div className="bg-card border border-border rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-md">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2
                        size={14}
                        className="sm:w-4 sm:h-4 animate-spin"
                      />
                      <span className="text-xs sm:text-sm">
                        ProjectMap AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <InputArea
        ref={inputAreaRef}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        hasMessages={messages.length > 0}
        onExportFullConversation={handleExportFullConversation}
      />
    </div>
  );
}
