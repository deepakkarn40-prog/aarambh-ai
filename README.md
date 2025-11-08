# Aarambh AI (Next.js)

A minimal but powerful **ChatGPT-like** chat app with **streaming**, **image generation**, **voice (STT/TTS)**, **model switch**, **simple rate limiting**, and **RAG-lite session docs**. Works with any **OpenAI-compatible** API (default: OpenAI).

## Quick Start

```bash
npm i

# .env.local (required)
OPENAI_API_KEY=sk-...

# Optional
# OPENAI_BASE_URL=https://api.openai.com/v1
# OPENAI_MODEL=gpt-4o-mini
# MODEL_WHITELIST=gpt-4o-mini,gpt-4o,gpt-4.1-mini,gpt-3.5-turbo

npm run dev
# open http://localhost:3000
```

## Features
- ✅ ChatGPT-style UI with bubbles
- ✅ **Streaming responses (SSE)**
- ✅ **Model selector** (server-side whitelist)
- ✅ **Image generation** (`/api/image`, default 1024x1792 9:16)
- ✅ **Voice**: speech-to-text (Web Speech API) + text-to-speech
- ✅ **RAG-lite**: Session notes pane, auto-injected to system prompt
- ✅ **Local history** in browser (no external DB)
- ✅ **Simple rate limit** (in-memory per IP)
- ✅ Secure: API key only used on server routes

## Deploy (Vercel)
1. Push to GitHub.
2. Import in Vercel → set env vars:
   - `OPENAI_API_KEY` (required)
   - `OPENAI_BASE_URL`, `OPENAI_MODEL`, `MODEL_WHITELIST` (optional)
3. Deploy.

> Note: In-memory rate limit resets on cold start (fine for basic usage). For heavy prod, use Redis-based limiter.

## RAG-lite Notes
For small snippets/FAQs, paste into **Session Docs**. They will be summarized into the system message automatically. For large corpora + semantic search, integrate a vector DB later (Pinecone/Chroma/Supabase).

## Image Generation
Uses OpenAI-compatible `images/generations`. Adjust `size` or provider as needed.

## Roadmap (optional)
- Auth + cloud DB (Supabase) for server-side chat history
- Tool/function calling
- Vector search with embeddings
- Payments/credits (Razorpay/Stripe)
