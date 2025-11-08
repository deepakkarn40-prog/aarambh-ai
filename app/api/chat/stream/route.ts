import { NextRequest } from "next/server";
import { streamProvider, ChatMessage } from "../../../../lib/provider";
import { allow } from "../../../../lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!allow(ip)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  try {
    const { messages, model } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response("messages array required", { status: 400 });
    }
    const safe: ChatMessage[] = messages.map((m: any) => ({ role: m.role, content: String(m.content || "") }));

    const stream = await streamProvider(safe, model);

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      start(controller) {
        const reader = stream.getReader();
        function pump() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              return;
            }
            // Forward chunks as text event stream
            controller.enqueue(encoder.encode(`data: ${new TextDecoder().decode(value)}\n\n`));
            pump();
          }).catch(err => {
            controller.error(err);
          });
        }
        pump();
      }
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive"
      }
    });
  } catch (e: any) {
    return new Response("Stream error: " + (e.message || "failed"), { status: 500 });
  }
}
