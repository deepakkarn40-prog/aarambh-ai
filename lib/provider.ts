export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const WHITELIST = (process.env.MODEL_WHITELIST || "gpt-4o-mini,gpt-4o,gpt-4.1-mini,gpt-3.5-turbo").split(",");

function pickModel(m?: string) {
  const envDefault = process.env.OPENAI_MODEL || "gpt-4o-mini";
  if (!m) return envDefault;
  return WHITELIST.includes(m) ? m : envDefault;
}

export async function callProvider(messages: ChatMessage[], modelHint?: string) {
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const apiKey = process.env.OPENAI_API_KEY;
  const model = pickModel(modelHint);
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const r = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, messages, temperature: 0.7 })
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Provider error ${r.status}: ${text}`);
  }
  const data = await r.json();
  const content = data?.choices?.[0]?.message?.content ?? "";
  return content;
}

export async function streamProvider(messages: ChatMessage[], modelHint?: string) {
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const apiKey = process.env.OPENAI_API_KEY;
  const model = pickModel(modelHint);
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const r = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, messages, temperature: 0.7, stream: true } as any)
  });

  if (!r.ok || !r.body) {
    const text = await r.text().catch(()=>"" );
    throw new Error(`Provider stream error ${r.status}: ${text}`);
  }
  return r.body as ReadableStream<Uint8Array>;
}
