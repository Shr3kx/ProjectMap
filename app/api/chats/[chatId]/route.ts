import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { generateChatNameFromMessages } from "@/lib/chatName";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  [key: string]: unknown;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .single();

  if (error || !data) {
    console.error("Error fetching chat:", error);
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  return NextResponse.json({ chat: data });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const messages = body?.messages as ChatMessage[] | undefined;
  const regenerateName = Boolean(body?.regenerateName);
  const isPinned = body?.isPinned as boolean | undefined;
  const folderId = body?.folderId as string | null | undefined;

  if (
    (!Array.isArray(messages) || messages.length === 0) &&
    typeof isPinned !== "boolean" &&
    typeof folderId === "undefined"
  ) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  const update: Record<string, unknown> = {};

  if (Array.isArray(messages) && messages.length > 0) {
    update.messages = messages;

    if (regenerateName) {
      update.chat_name = generateChatNameFromMessages(messages);
    }
  }

  if (typeof isPinned === "boolean") {
    update.is_pinned = isPinned;
  }

  if (typeof folderId !== "undefined") {
    update.folder_id = folderId;
  }

  const { data, error } = await supabase
    .from("chats")
    .update(update)
    .eq("id", chatId)
    .eq("user_id", user.id)
    .select("id, chat_name, created_at, updated_at, folder_id, is_pinned")
    .single();

  if (error || !data) {
    console.error("Error updating chat:", error);
    return NextResponse.json(
      { error: "Failed to update chat" },
      { status: 500 },
    );
  }

  return NextResponse.json({ chat: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { error } = await supabase
    .from("chats")
    .delete()
    .eq("id", chatId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
