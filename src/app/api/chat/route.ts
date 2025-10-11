import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Convert messages to Gemini API format
    const geminiContents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    // Add system instruction as the first message if not present
    const systemMessage = {
      role: "user",
      parts: [{ 
        text: "You are ProjectMap AI, a helpful project-planning assistant. You help users create project roadmaps, break down tasks, and organize their ideas into clear, actionable plans. Always maintain context from previous messages in the conversation." 
      }]
    };

    const systemResponse = {
      role: "model", 
      parts: [{ text: "I understand. I'm ProjectMap AI, your project-planning assistant. I'll help you create roadmaps and organize your ideas while maintaining context throughout our conversation." }]
    };

    // Gemini API endpoint
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

    const response = await fetch(`${url}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [systemMessage, systemResponse, ...geminiContents],
      }),
    });

    const data = await response.json();

    // Check if the response contains the expected structure
    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content
    ) {
      console.error("Unexpected API response structure:", data);
      return NextResponse.json(
        { error: "Invalid response from Gemini API", details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reply: data.candidates[0].content.parts[0].text,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
