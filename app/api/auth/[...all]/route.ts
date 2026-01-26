import { handler } from "@/lib/auth-server";

// The handler from convexBetterAuthNextJs should already be in the correct format
// for Next.js App Router with GET and POST methods
export const { GET, POST } = handler;
