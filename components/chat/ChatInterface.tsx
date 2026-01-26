"use client";

import React, { useState, useEffect, useRef } from "react";
import { Message, Attachment } from "@/types/chat";

import { MessageBubble } from "./MessageBubble";
import { CombinedPromptInput } from "./promptInput";
import { projectMapConfig } from "@/lib/ai";
import type { ChatAttachment } from "./chatContainer";
import toast from "react-hot-toast";
import {
  Loader2,
  Sparkles,
  MessageSquare,
  Wand2,
  Code,
  GraduationCap,
} from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  exportConversationToPDF,
  exportFromMessageToPDF,
} from "@/utils/pdfExport";
import { parseRoadmapFromContent } from "@/utils/parseRoadmap";
import { useTheme } from "@/contexts/ThemeContext";
import { useSession } from "@/lib/auth-client";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface MessageWithMetadata extends Message {
  modelName?: string;
  timeTaken?: number;
}

const categories = [
  { id: "general", label: "General" },
  { id: "creative", label: "Creative" },
  { id: "learning", label: "Learning" },
  { id: "coding", label: "Coding" },
];

const allSamplePrompts = {
  general: [
    "What are the key differences between classical and quantum computing?",
    "Explain how machine learning algorithms work for someone new to tech",
    "What are the most effective strategies for time management?",
    "How do electric vehicles compare to traditional combustion engines?",
    "What are the main challenges in sustainable urban development?",
    "Explain the concept of blockchain in simple terms",
    "What are the latest breakthroughs in renewable energy?",
    "How does artificial intelligence impact healthcare?",
    "What are the fundamentals of personal finance management?",
  ],
  creative: [
    "Write a short story about a robot discovering emotions",
    "Create a 7-day itinerary for a trip to Tokyo, Japan",
    "Generate ideas for a science fiction novel set 500 years in the future",
    "Design a magical system for a fantasy world",
    "Write a poem about the changing seasons",
    "Create a backstory for a superhero with unusual powers",
    "Develop a concept for an eco-friendly smart city",
    "Write a dialogue between two historical figures",
    "Design a unique restaurant concept with a specific theme",
  ],
  learning: [
    "Explain the theory of relativity in simple terms",
    "What are the most important events of World War II?",
    "How does photosynthesis work in plants?",
    "Explain the process of human evolution",
    "How does the human immune system work?",
    "What are the fundamental principles of psychology?",
    "Explain the water cycle and its importance",
    "How do black holes form and function?",
    "What are the major periods in art history?",
  ],
  coding: [
    "What are the best practices for React performance optimization?",
    "Explain how async/await works in JavaScript",
    "What is the difference between REST and GraphQL APIs?",
    "How do you implement authentication in a web application?",
    "Explain the principles of clean code architecture",
    "What are design patterns and when should they be used?",
    "How does garbage collection work in modern programming languages?",
    "Explain the concept of microservices architecture",
    "What are the SOLID principles in object-oriented programming?",
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
    <div className="flex flex-col h-full max-w-2xl mx-auto px-4 text-left pt-50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Hey, how can I help you today?
        </h1>
        <p className="text-muted-foreground mb-6">
          ProjectMap is an ad-free, no data collection, no bullshit chatbot. Ask
          anything to begin your conversation.
        </p>
      </div>

      <div className="w-full">
        <div className="flex gap-2 mb-4">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`flex items-center rounded-md gap-2 px-4 py-2 text-sm font-medium transition-colors ${
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
                  className="flex w-full justify-start px-4 py-4 h-auto text-left hover:bg-foreground/8 transition-colors duration-200 rounded-lg border border-foreground/10 bg-card/20 text-foreground/70 hover:text-foreground/90"
                  onClick={() => onPromptClick(prompt)}
                >
                  <MessageSquare className="h-4 w-4 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-sm">{prompt}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export function ChatInterface() {
  const [messages, setMessages] = useState<MessageWithMetadata[]>([]);
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const requestStartTime = useRef<number>(0);
  const { cycleTheme } = useTheme();

  // Authentication and chat saving
  const { data: session } = useSession();
  const saveMessage = useMutation(api.chats.saveMessage);
  const conversationIdRef = useRef<string | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Generate conversation ID when user logs in (will be used when first message is sent)
  useEffect(() => {
    if (session?.user && !conversationIdRef.current) {
      conversationIdRef.current = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    } else if (!session?.user) {
      // Clear conversation ID when user logs out
      conversationIdRef.current = null;
    }
  }, [session]);

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
    ],
    enabled: true,
  });

  const handleSendMessage = async (
    content: string,
    attachments?: Attachment[],
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

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    requestStartTime.current = Date.now();
    setInputValue("");
    setAttachments([]);

    try {
      // Prepare request body
      const requestBody = {
        messages: [
          ...messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          {
            role: "user",
            content,
          },
        ],
        webSearchEnabled:
          webSearchEnabled && projectMapConfig.features.webSearch,
        attachments: attachments?.map(a => ({
          type: a.type,
          name: a.name,
          mimeType: a.mimeType,
          data: a.data,
        })),
      };

      // Call API
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

      // Calculate time taken
      const timeTaken = Date.now() - requestStartTime.current;

      const { contentWithoutRoadmap, roadmapData } = parseRoadmapFromContent(
        data.content,
      );

      const assistantMessage: MessageWithMetadata = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: contentWithoutRoadmap,
        timestamp: Date.now(),
        modelName: projectMapConfig.name,
        timeTaken: timeTaken,
        ...(roadmapData && {
          roadmapData,
          rawContent: data.content,
        }),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Set loading to false immediately after message is added
      setIsLoading(false);

      // Save messages to backend if user is logged in (silently in background)
      // This happens after loading is set to false so it doesn't affect the UI
      if (session?.user) {
        // Ensure conversationId is set
        if (!conversationIdRef.current) {
          conversationIdRef.current = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }

        try {
          // Save user message
          const userMessageId = await saveMessage({
            conversationId: conversationIdRef.current,
            role: userMessage.role,
            content: userMessage.content,
            timestamp: userMessage.timestamp,
            attachments: userMessage.attachments?.map(a => ({
              type: a.type,
              name: a.name,
              size: a.size,
              data: a.data,
              mimeType: a.mimeType,
              preview: a.preview,
            })),
          });

          // Save assistant message (use raw content when roadmap was parsed)
          const assistantMessageId = await saveMessage({
            conversationId: conversationIdRef.current,
            role: assistantMessage.role,
            content: assistantMessage.rawContent ?? assistantMessage.content,
            timestamp: assistantMessage.timestamp,
            modelName: assistantMessage.modelName,
            timeTaken: assistantMessage.timeTaken,
          });
        } catch (saveError) {
          // Log error for debugging
          console.error("Failed to save chat:", saveError);
          if (saveError instanceof Error) {
            console.error("Error message:", saveError.message);
            console.error("Error stack:", saveError.stack);
          }
        }
      } else {
        // Log when user is not logged in (for debugging)
        console.log("Chat not saved: User is not logged in");
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send message",
      );
      // Set loading to false on error as well
      setIsLoading(false);
    }
  };

  const handleWebSearchToggle = () => {
    setWebSearchEnabled(prev => !prev);
  };

  const handleEditMessage = (messageId: string, content: string) => {
    // Set the content in the input area
    setInputValue(content);

    // Remove this message and all messages after it
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
      setMessages(messages.slice(0, messageIndex));
    }
  };

  const handleRegenerateResponse = async (messageId: string) => {
    // Find the message index
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Get the previous user message
    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex < 0 || messages[userMessageIndex].role !== "user") {
      toast.error("Cannot regenerate: no previous user message found");
      return;
    }

    const userMessage = messages[userMessageIndex];

    // Remove this AI message and all messages after it
    setMessages(messages.slice(0, messageIndex));

    // Regenerate by re-sending the user message
    // Note: This will trigger handleSendMessage which will save both messages
    await handleSendMessage(userMessage.content, userMessage.attachments);
  };

  const handleExportMessageToPDF = (messageId: string) => {
    try {
      exportFromMessageToPDF(messages, messageId, {
        title: "ProjectMap Chat Export",
        includeTimestamps: true,
        includeMetadata: true,
      });
      toast.success("Chat exported to PDF!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    }
  };

  const handleExportFullConversation = () => {
    if (messages.length === 0) {
      toast.error("No messages to export");
      return;
    }

    try {
      exportConversationToPDF(messages, {
        title: "ProjectMap Chat Conversation",
        includeTimestamps: true,
        includeMetadata: true,
      });
      toast.success("Full conversation exported to PDF!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    }
  };

  const IconComponent = Sparkles;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto flex-col ${
          messages.length === 0 ? "flex items-center justify-center" : "pt-4"
        } pb-60`}
      >
        {messages.length === 0 ? (
          // Initial empty state with sample prompts
          <EmptyState onPromptClick={handleSendMessage} />
        ) : (
          // Messages list
          <div className="max-w-4xl mx-auto px-4 space-y-1">
            {messages.map(message => (
              <MessageBubble
                key={message.id}
                message={message}
                modelName={message.modelName}
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

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <IconComponent size={18} />
                </div>
                <div className="flex-1 max-w-[80%]">
                  <div className="bg-card border border-border rounded-2xl px-4 py-3 shadow-md">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-sm">
                        {projectMapConfig.name} is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
        {/* Input Area */}
        <CombinedPromptInput
          value={inputValue}
          onValueChange={setInputValue}
          onSubmit={() => {
            // Convert ChatAttachment[] to Attachment[]
            const convertedAttachments: Attachment[] | undefined =
              attachments.length > 0
                ? attachments.map(att => ({
                    type: att.kind === "image" ? "image" : "file",
                    name: att.name,
                    size: att.size,
                    data: att.dataUrl || "",
                    mimeType: att.type,
                    preview: att.dataUrl,
                  }))
                : undefined;
            handleSendMessage(inputValue, convertedAttachments);
          }}
          attachments={attachments}
          onRemoveAttachment={(id: string) => {
            setAttachments(prev => prev.filter(att => att.id !== id));
          }}
          onFilesSelected={(files: File[]) => {
            files.forEach(file => {
              const id = `att-${Date.now()}-${Math.random()}`;
              const isImage = file.type.startsWith("image/");
              const reader = new FileReader();
              
              reader.onload = e => {
                const dataUrl = e.target?.result as string;
                setAttachments(prev => [
                  ...prev,
                  {
                    id,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    kind: isImage ? "image" : "file",
                    dataUrl,
                  },
                ]);
              };
              
              reader.readAsDataURL(file);
            });
          }}
          searchEnabled={webSearchEnabled}
          onToggleSearch={handleWebSearchToggle}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
