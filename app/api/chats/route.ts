import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { generateChatNameFromMessages } from "@/lib/chatName";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  [key: string]: unknown;
};

export async function GET(_req: NextRequest) {
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
    .select("id, chat_name, created_at, updated_at, folder_id, is_pinned")
    .eq("user_id", user.id)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 },
    );
  }

  return NextResponse.json({ chats: data ?? [] });
}

export async function POST(req: NextRequest) {
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

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "messages array is required" },
      { status: 400 },
    );
  }

  const chatName = generateChatNameFromMessages(messages);

  const { data, error } = await supabase
    .from("chats")
    .insert({
      user_id: user.id,
      chat_name: chatName,
      messages,
    })
    .select("id, chat_name, created_at, updated_at, folder_id, is_pinned")
    .single();

  if (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 },
    );
  }

  return NextResponse.json({ chat: data }, { status: 201 });
}

