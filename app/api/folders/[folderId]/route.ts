import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { folderId: string } },
) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const name = (body?.name as string | undefined)?.trim();

  if (!name) {
    return NextResponse.json(
      { error: "Folder name is required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("folders")
    .update({ name })
    .eq("id", params.folderId)
    .eq("user_id", user.id)
    .select("id, name, created_at")
    .single();

  if (error || !data) {
    console.error("Error updating folder:", error);
    return NextResponse.json(
      { error: "Failed to update folder" },
      { status: 500 },
    );
  }

  return NextResponse.json({ folder: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { folderId: string } },
) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // First, detach any chats from this folder
  const { error: chatsError } = await supabase
    .from("chats")
    .update({ folder_id: null })
    .eq("folder_id", params.folderId)
    .eq("user_id", user.id);

  if (chatsError) {
    console.error("Error detaching chats from folder:", chatsError);
    return NextResponse.json(
      { error: "Failed to detach chats from folder" },
      { status: 500 },
    );
  }

  const { error } = await supabase
    .from("folders")
    .delete()
    .eq("id", params.folderId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

