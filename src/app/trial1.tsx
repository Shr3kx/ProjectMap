"use client";

import { useState } from "react";
import ChatPage from "@/components/chatBot/page";
import Page from "./page";

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
    <Page></Page>
    // <AppSidebar onChatSelect={handleChatSelect} onNewChat={handleNewChat}>
    //   <div className="h-full w-full">

    //     <ChatPage selectedChatId={selectedChatId} isNewChat={isNewChat} />
    //   </div>
    // </AppSidebar>
  );
}
