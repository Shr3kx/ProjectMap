import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function createSupabaseServerClient() {
  return createRouteHandlerClient({
    cookies: cookies,
  });
}

