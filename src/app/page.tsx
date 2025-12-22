"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/sidebar";
import ChatPage from "@/components/chatBot/page";
import WorkflowDiagram from "@/components/roadmap/page";

export default function HomePage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isNewChat, setIsNewChat] = useState(false);

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setIsNewChat(false); // Clear new chat state when selecting existing chat
  };

  const handleNewChat = () => {
    setSelectedChatId(null); // Clear selected chat
    setIsNewChat(true); // Set new chat state
  };

  return (
    <AppSidebar onChatSelect={handleChatSelect} onNewChat={handleNewChat}>
      <div className="h-full w-full">
        {/* <WorkflowDiagram /> */}
        <ChatPage selectedChatId={selectedChatId} isNewChat={isNewChat} />
      </div>
    </AppSidebar>
  );
}
