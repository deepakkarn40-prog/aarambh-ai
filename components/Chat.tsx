"use client";
import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import ModelSelector from "./ModelSelector";
import VoiceControls from "./VoiceControls";
import DocPanel from "./DocPanel";

type Msg = { role: "user" | "assistant" | "system"; content: string };
type Doc = { id:string; name:string; content:string };

const STORAGE_KEY = "aarambh-ai:history";

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "नमस्ते! मैं Aarambh AI हूँ — आपकी कैसे मदद कर सकता/सकती हूँ?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [system, setSystem] = useState("You are a helpful assistant.");
  const [model, setModel] = useState("gpt-4o-mini");
  const [docs, setDocs] = useState<Doc[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendStream() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    // Inject doc context (RAG-lite): prep a short system note summarizing docs
    const docsNote = docs.length ? `\nYou also have access to these session notes (short, prioritize factual extraction):\n` + docs.map((d,i)=>`[${i+1}] ${d.content.slice(0,1200)}`).join("\n\n") : "";

    const next = [
      { role: "system", content: system + docsNote },
      ...messages,
      { role: "user", content: text }
    ] as Msg[];

    setMessages([...messages, { role: "user", content: text }, { role: "assistant", content: "" }] );
    setLoading(true);

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, model })
      });
      if (!res.ok || !res.body) {
        throw new Error(await res.text());
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        // server sends "data: {json}\n\n". Parse delta tokens from provider
        for (const line of chunk.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") break;
          try {
            const data = JSON.parse(payload);
            const delta = data?.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              acc += delta;
              setMessages(curr => {
                const copy = curr.slice();
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch {
            // ignore non-json lines from some providers
          }
        }
      }
    } catch (e:any) {
      setMessages(curr => [...curr, { role: "assistant", content: "Error: " + e.message }]);
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendStream();
    }
  }

  function handleVoiceTranscript(t:string){
    setInput(prev => (prev ? prev + " " + t : t));
  }

  async function generateImage() {
    const text = prompt("Image Prompt (e.g., 9:16 Mahadev cosmic, no text)");
    if (!text) return;
    const res = await fetch("/api/image", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ prompt: text, size: "1024x1792" })
    });
    const data = await res.json();
    const url = data?.data?.[0]?.url;
    if (url) {
      setMessages(curr => [...curr, { role:"assistant", content: `🔗 Image generated: ${url}` }]);
      try { window.open(url, "_blank"); } catch {}
    } else {
      setMessages(curr => [...curr, { role:"assistant", content: "Image generation failed." }]);
    }
  }

  function clearChat(){
    if (!confirm("Clear chat history on this device?")) return;
    setMessages([{ role:"assistant", content:"इतिहास साफ़ कर दिया गया है। नई बातचीत शुरू करें।" }]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header style={{ borderBottom: "1px solid #30363d", padding: "14px 16px", position: "sticky", top: 0, background: "#0b0f14", zIndex: 10 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", gap: 10, alignItems: "center", flexWrap:"wrap" }}>
          <img src="/logo.svg" alt="Aarambh AI" style={{ width: 24, height: 24, borderRadius: 6 }} />
          <div style={{ fontWeight: 700 }}>Aarambh AI</div>
          <div style={{ opacity: 0.7, fontSize: 12 }}>ChatGPT-like • Streaming • Images • Voice • RAG-lite</div>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 1000, margin: "0 auto", width: "100%", padding: 16, display:"grid", gap:16, gridTemplateColumns:"1fr", gridAutoRows:"minmax(0,auto)" }}>
        {/* Controls row */}
        <div style={{ display:"grid", gap:12, gridTemplateColumns:"1fr" }}>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
            <ModelSelector value={model} onChange={setModel} />
            <VoiceControls onTranscript={handleVoiceTranscript} />
            <button onClick={generateImage} style={{ background:"#8957e5", border:"1px solid #986ee2", padding:"6px 10px", borderRadius:8, color:"#fff" }}>🖼️ Image</button>
            <button onClick={clearChat} style={{ background:"#3c3c3c", border:"1px solid #30363d", padding:"6px 10px", borderRadius:8, color:"#fff" }}>🧹 Clear</button>
          </div>
          <div>
            <div style={{ marginBottom: 6, fontSize: 12, opacity: 0.8 }}>System Prompt:</div>
            <textarea
              value={system}
              onChange={e => setSystem(e.target.value)}
              rows={3}
              style={{ width: "100%", background: "#0d1117", color: "#e6edf3", border: "1px solid #30363d", borderRadius: 8, padding: 10 }}
            />
          </div>
          <DocPanel onDocs={setDocs} />
        </div>

        {/* Chat area */}
        <div>
          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} text={m.content} />
          ))}
          {loading && <MessageBubble role="assistant" text="सोच रहा/रही हूँ…" />}
          <div ref={bottomRef} />
        </div>
      </main>

      <footer style={{ borderTop: "1px solid #30363d", padding: 12, position: "sticky", bottom: 0, background: "#0b0f14" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <textarea
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="अपना संदेश लिखें और Enter दबाएँ…"
            style={{ width: "100%", background: "#0d1117", color: "#e6edf3", border: "1px solid #30363d", borderRadius: 8, padding: 10 }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={sendStream} disabled={loading} style={{
              background: "#238636",
              border: "1px solid #2ea043",
              padding: "8px 14px",
              borderRadius: 8,
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
              opacity: loading ? 0.7 : 1
            }}>Send</button>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
            Tip: Shift+Enter for new line • Your API key stays on the server.
          </div>
        </div>
      </footer>
    </div>
  );
}
