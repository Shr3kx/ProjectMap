// All sidebar action logic separated from UI components

import type { Chat, Folder, SidebarState } from "./sidebar-types";

/**
 * Generate a unique ID for new items
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new folder
 */
export function createFolder(state: SidebarState, name: string): SidebarState {
  const newFolder: Folder = {
    id: generateId(),
    name,
    createdAt: new Date(),
  };

  return {
    ...state,
    folders: [...state.folders, newFolder],
  };
}

/**
 * Rename an existing folder
 */
export function renameFolder(
  state: SidebarState,
  folderId: string,
  newName: string
): SidebarState {
  return {
    ...state,
    folders: state.folders.map(folder =>
      folder.id === folderId ? { ...folder, name: newName } : folder
    ),
  };
}

/**
 * Delete a folder and unassign all chats from it
 */
export function deleteFolder(
  state: SidebarState,
  folderId: string
): SidebarState {
  return {
    ...state,
    folders: state.folders.filter(folder => folder.id !== folderId),
    chats: state.chats.map(chat =>
      chat.folderId === folderId ? { ...chat, folderId: null } : chat
    ),
  };
}

/**
 * Create a new chat
 */
export function createChat(state: SidebarState, title: string): SidebarState {
  const newChat: Chat = {
    id: generateId(),
    title,
    createdAt: new Date(),
    isPinned: false,
    folderId: null,
  };

  return {
    ...state,
    chats: [newChat, ...state.chats],
  };
}

/**
 * Toggle pin status of a chat
 */
export function togglePinChat(
  state: SidebarState,
  chatId: string
): SidebarState {
  return {
    ...state,
    chats: state.chats.map(chat =>
      chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
    ),
  };
}

/**
 * Assign a chat to a folder
 */
export function assignChatToFolder(
  state: SidebarState,
  chatId: string,
  folderId: string | null
): SidebarState {
  return {
    ...state,
    chats: state.chats.map(chat =>
      chat.id === chatId ? { ...chat, folderId } : chat
    ),
  };
}

/**
 * Delete a chat
 */
export function deleteChat(state: SidebarState, chatId: string): SidebarState {
  return {
    ...state,
    chats: state.chats.filter(chat => chat.id !== chatId),
  };
}

/**
 * Get chats grouped by date
 */
export function getChatsByDate(chats: Chat[]): {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  older: Chat[];
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  return {
    today: chats.filter(
      chat => chat.createdAt >= today && !chat.isPinned && !chat.folderId
    ),
    yesterday: chats.filter(
      chat =>
        chat.createdAt >= yesterday &&
        chat.createdAt < today &&
        !chat.isPinned &&
        !chat.folderId
    ),
    lastWeek: chats.filter(
      chat =>
        chat.createdAt >= lastWeek &&
        chat.createdAt < yesterday &&
        !chat.isPinned &&
        !chat.folderId
    ),
    older: chats.filter(
      chat => chat.createdAt < lastWeek && !chat.isPinned && !chat.folderId
    ),
  };
}

/**
 * Get pinned chats
 */
export function getPinnedChats(chats: Chat[]): Chat[] {
  return chats.filter(chat => chat.isPinned);
}

/**
 * Get chats in a specific folder
 */
export function getChatsByFolder(chats: Chat[], folderId: string): Chat[] {
  return chats.filter(chat => chat.folderId === folderId);
}
