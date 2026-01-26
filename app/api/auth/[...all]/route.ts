import { handler } from "@/lib/auth-server";

// Ensure this runs in Node.js runtime (not Edge) for full compatibility
export const runtime = "nodejs";

// Handler from convexBetterAuthNextJs returns an object with GET and POST methods
export const { GET, POST } = handler;
