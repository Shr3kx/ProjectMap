
export interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  isPinned: boolean;
  folderId: string | null;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: Date;
}

export interface SidebarState {
  chats: Chat[];
  folders: Folder[];
}
