import { NextRequest } from "next/server";
import { callProvider, ChatMessage } from "../../../lib/provider";

export const runtime = "nodejs"; // easier for local dev; can be 'edge' too

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), { status: 400 });
    }
    const safeMessages: ChatMessage[] = messages.map((m: any) => ({
      role: m.role,
      content: String(m.content || "")
    }));

    const reply = await callProvider(safeMessages);

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "failed" }), { status: 500 });
  }
}
