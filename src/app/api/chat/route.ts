import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
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

    // Gemini API endpoint
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

    const response = await fetch(`${url}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: message,
              },
            ],
          },
        ],
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
