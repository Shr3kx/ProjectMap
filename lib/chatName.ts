type AnyChatMessage = {
  role: "user" | "assistant" | "system";
  content: unknown;
};

function cleanText(raw: string): string {
  // Remove code fences
  let text = raw.replace(/```[\s\S]*?```/g, " ");
  // Strip markdown headings and bullets
  text = text.replace(/^#{1,6}\s+/gm, "");
  text = text.replace(/^\s*[-*]\s+/gm, "");
  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

function pickBestSentence(text: string): string | null {
  if (!text) return null;

  // Prefer up to first question mark
  const questionIdx = text.indexOf("?");
  if (questionIdx !== -1 && questionIdx <= 140) {
    return text.slice(0, questionIdx + 1);
  }

  // Otherwise, split on sentence boundaries
  const match = text.match(/[^.!?]+[.!?]?/);
  if (!match) return null;
  return match[0].trim();
}

export function generateChatNameFromMessages(
  messages: AnyChatMessage[],
): string {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "New chat";
  }

  // Prefer user messages, but fall back to assistant/system if needed
  const userMessages = messages.filter(m => m.role === "user");
  const candidates =
    userMessages.length > 0 ? userMessages : messages.filter(m => m.role !== "system");

  for (const msg of candidates) {
    if (typeof msg.content !== "string") continue;
    const cleaned = cleanText(msg.content);
    if (!cleaned) continue;

    const sentence = pickBestSentence(cleaned) ?? cleaned;
    if (!sentence) continue;

    const trimmed = sentence.replace(/\s+/g, " ").trim();
    if (!trimmed) continue;

    const truncated = trimmed.slice(0, 80);
    return truncated.length < trimmed.length ? `${truncated}…` : truncated;
  }

  return "New chat";
}

