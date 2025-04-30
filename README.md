# Layercode Conversational AI Backend (Hono + Cloudflare Workers)

A lightweight TypeScript service built with **Hono** for Cloudflare Workers that streams text-to-speech-ready replies from Google Gemini over Server-Sent Events (SSE). Each conversation is isolated by `session_id` so context is preserved across turns.

---

## ✨ Features

- **Session state** stored in memory – one history per user (per Worker instance).
- **Real-time streaming** – incremental `response.tts` chunks delivered via SSE.
- **Google Gemini SDK** integration (`@ai-sdk/google`).
- **Graceful fall-backs** – friendly responses on errors.
- **Modern stack** – Hono, HTMX, Tailwind, DaisyUI, Cloudflare Workers.

---

## 🚀 Quick Start

> Requires **[Bun](https://bun.sh) 1.0+**, **Node.js 18+** (for Cloudflare Workers), and a valid **Gemini API key**.

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

```
data: {"type":"response.tts","content":"Hi there!","turn_id":"turn-0001"}

data: {"type":"response.end","turn_id":"turn-0001"}
```

| Type           | Description                         |
| -------------- | ----------------------------------- |
| `response.tts` | A partial or complete chunk of text |
| `response.end` | Indicates the turn has finished     |

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
- `wrangler` – Cloudflare Workers CLI

All pinned in `package.json`.

---

## 🩹 Troubleshooting

| Symptom                                   | Fix                              |
| ----------------------------------------- | -------------------------------- |
| `GOOGLE_GENERATIVE_AI_API_KEY is not set` | Export var or add to `.dev.vars` |
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
