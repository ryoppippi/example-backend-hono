# Layercode Conversational AI Backend (Hono + Cloudflare Workers)

A lightweight TypeScript service built with **Hono** for Cloudflare Workers that streams text-to-speech-ready replies from Google Gemini over Server-Sent Events (SSE). Each conversation is isolated by `session_id` so context is preserved across turns.

---

## ✨ Features

- **Session state** stored in memory – one history per user (per Worker instance).
- **Real-time streaming** – incremental `response.tts` chunks delivered via SSE.
- **Google Gemini SDK** integration (`@ai-sdk/google`).
- **SSE streaming powered by [`@layercode/node-server-sdk`](https://www.npmjs.com/package/@layercode/node-server-sdk`)** – abstracts away manual SSE handling for robust, simple streaming.
- **Graceful fall-backs** – friendly responses on errors.
- **Modern stack** – Hono, HTMX, Tailwind, DaisyUI, Cloudflare Workers.

---

## 🚀 Quick Start

> Requires **[Bun](https://bun.sh) 1.0+**, **Node.js 18+** (for Cloudflare Workers), a valid **Gemini API key**, and a **Layercode webhook secret**.

```bash
# Install dependencies
bun install

# Start local dev server (with live reload)
bun run dev

# Deploy to Cloudflare Workers
bun run deploy
```

---

## 🔧 Configuration

Add a `.dev.vars` file (or use `.dev.vars.example` as a template):

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
LAYERCODE_WEBHOOK_SECRET=your_webhook_secret_here
```

---

## 🗺️ API

### POST `/agent`

Send the user's text and receive streamed chunks.

#### Request JSON

```jsonc
{
  "text": "Hello, how are you?",
  "type": "message", // "message" or "session.start"
  "session_id": "sess-1234",
  "turn_id": "turn-0001"
}
```

#### Streaming Response (SSE)

All streaming and SSE response handling is managed by [`@layercode/node-server-sdk`](https://www.npmjs.com/package/@layercode/node-server-sdk), which provides a simple interface for sending TTS and data chunks to the client, abstracting away manual SSE logic.

```
data: {"type":"response.tts","content":"Hi there!","turn_id":"turn-0001"}

data: {"type":"response.end","turn_id":"turn-0001"}
```

| Type           | Description                         |
| -------------- | ----------------------------------- |
| `response.tts` | A partial or complete chunk of text |
| `response.end` | Indicates the turn has finished     |

#### Implementation Notes

- The `/agent` endpoint uses Cloudflare Workers' native streaming capabilities.
- The route handler uses `@layercode/node-server-sdk` for SSE streaming and response handling.
- Make sure you are running on **Node.js 18 or newer** for local development.

---

## 🧩 Project Structure

| Path           | Purpose                           |
| -------------- | --------------------------------- |
| `src/agent.ts` | Service implementation            |
| `src/index.ts` | Hono app entrypoint & routing     |
| `.dev.vars`    | **Not committed** – local secrets |
| `README.md`    | You are here                      |

---

## 🛠️ Dependencies

- `hono` – web framework for Cloudflare Workers
- `@ai-sdk/google` – Gemini SDK
- `ai` – streaming and message handling
- `@hono/zod-validator` / `zod` – request validation
- `@layercode/node-server-sdk` – abstracts SSE streaming and response handling
- `wrangler` – Cloudflare Workers CLI

All pinned in `package.json`.

---

## 🩹 Troubleshooting

| Symptom                                   | Fix                              |
| ----------------------------------------- | -------------------------------- |
| `GOOGLE_GENERATIVE_AI_API_KEY is not set` | Export var or add to `.dev.vars` |
| `LAYERCODE_WEBHOOK_SECRET is not set`     | Export var or add to `.dev.vars` |
| Empty or truncated response               | Check session consistency & logs |
| Worker not responding                     | Check `wrangler` logs and config |

---

## 🔐 Security Notes

- Do **not** commit your `.dev.vars` / secrets.
- Use HTTPS & proper auth in production.
- Consider rate-limiting and persistence (e.g., Durable Objects, KV) for sessions.

---

## 📝 License

No LICENSE file in this directory. See the root of the Layercode repo for license details.
