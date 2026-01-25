import { NextRequest, NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { projectMapConfig } from "@/lib/ai";

// Disable edge runtime to support all features
export const runtime = "nodejs";

// Global key rotation state
let currentKeyIndex = 0;
let keyRotationAttempts = 0;
const MAX_ROTATION_ATTEMPTS = 10;

// Get all available API keys
function getAvailableApiKeys(): string[] {
  const keys: string[] = [];

  // Primary key
  if (process.env.GOOGLE_API_KEY) {
    keys.push(process.env.GOOGLE_API_KEY);
  }

  // Additional keys
  for (let i = 2; i <= 10; i++) {
    const key = process.env[`GOOGLE_API_KEY_${i}`];
    if (key) {
      keys.push(key);
    }
  }

  return keys;
}

// Get next API key in rotation
function getNextApiKey(): string | null {
  const keys = getAvailableApiKeys();

  if (keys.length === 0) {
    return null;
  }

  // Rotate to next key
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  return keys[currentKeyIndex];
}

// Get current API key
function getCurrentApiKey(): string | null {
  const keys = getAvailableApiKeys();

  if (keys.length === 0) {
    return null;
  }

  return keys[currentKeyIndex];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      webSearchEnabled = false,
      attachments = [],
    } = body;

    // Validate API keys
    const availableKeys = getAvailableApiKeys();
    if (availableKeys.length === 0) {
      return NextResponse.json(
        {
          error:
            "No Google API keys configured. Please add GOOGLE_API_KEY to your .env.local file.",
        },
        { status: 500 },
      );
    }

    // Reset rotation attempts for new request
    keyRotationAttempts = 0;

    // Attempt API call with key rotation
    let lastError: Error | null = null;

    while (
      keyRotationAttempts <
      Math.min(MAX_ROTATION_ATTEMPTS, availableKeys.length)
    ) {
      try {
        const apiKey = getCurrentApiKey();
        if (!apiKey) {
          throw new Error("No API key available");
        }

        // Initialize Google AI with current API key
        const google = createGoogleGenerativeAI({
          apiKey: apiKey,
        });

        // Handle multimodal content with attachments
        let conversationMessages = messages;

        if (attachments && attachments.length > 0) {
          // Find the last user message and enhance it with attachments
          const lastMessageIndex = messages.length - 1;
          if (messages[lastMessageIndex].role === "user") {
            const textContent = messages[lastMessageIndex].content;
            const multimodalParts = [];

            // Add text content
            if (textContent) {
              multimodalParts.push({
                type: "text" as const,
                text: textContent,
              });
            }

            // Add image/file attachments
            for (const attachment of attachments) {
              if (attachment.type === "image") {
                // Extract base64 data
                const base64Data =
                  attachment.data.split(",")[1] || attachment.data;
                multimodalParts.push({
                  type: "image" as const,
                  image: base64Data,
                  mimeType: attachment.mimeType || "image/jpeg",
                });
              } else {
                // For non-image files, include as text context
                multimodalParts.push({
                  type: "text" as const,
                  text: `[Attached file: ${attachment.name} (${attachment.mimeType})]`,
                });
              }
            }

            // Replace last message with multimodal content
            conversationMessages = [
              ...messages.slice(0, lastMessageIndex),
              {
                role: "user",
                content: multimodalParts,
              },
            ];
          }
        }

        // Configure the model (always ProjectMap)
        const modelName = projectMapConfig.model;
        const model = google(modelName);

        // Generate response
        const result = await generateText({
          model,
          system: projectMapConfig.systemPrompt,
          messages: conversationMessages,
          temperature: projectMapConfig.generationConfig.temperature,
          maxTokens: projectMapConfig.generationConfig.maxOutputTokens,
          providerOptions: {
            google: {
              safetySettings: [
                {
                  category: "HARM_CATEGORY_HARASSMENT",
                  threshold: "BLOCK_NONE",
                },
                {
                  category: "HARM_CATEGORY_HATE_SPEECH",
                  threshold: "BLOCK_NONE",
                },
                {
                  category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                  threshold: "BLOCK_NONE",
                },
                {
                  category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                  threshold: "BLOCK_NONE",
                },
              ],
            },
          },
        });

        // Success! Return the result
        return NextResponse.json({
          content: result.text,
          usage: result.usage,
          keyUsed: currentKeyIndex + 1,
          totalKeysAvailable: availableKeys.length,
        });
      } catch (error) {
        lastError = error as Error;

        // Check if it's a rate limit error
        const isRateLimitError =
          error instanceof Error &&
          (error.message.includes("rate limit") ||
            error.message.includes("quota") ||
            error.message.includes("429"));

        if (
          isRateLimitError &&
          keyRotationAttempts < availableKeys.length - 1
        ) {
          console.log(
            `Rate limit hit on key ${currentKeyIndex + 1}, rotating to next key...`,
          );
          keyRotationAttempts++;
          getNextApiKey(); // Rotate to next key
          continue; // Retry with next key
        }

        // If not a rate limit error, or we've tried all keys, throw
        throw error;
      }
    }

    // If we get here, all keys were rate limited
    throw new Error(
      `All ${availableKeys.length} API keys are rate limited. Please try again later.`,
    );
  } catch (error) {
    console.error("Chat API error:", error);

    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please wait a moment." },
          { status: 429 },
        );
      }

      return NextResponse.json(
        { error: error.message || "An error occurred" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
