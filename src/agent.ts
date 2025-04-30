import { streamSSE } from "hono/streaming";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, CoreMessage } from "ai";
import { createFactory } from "hono/factory";
import { env } from "cloudflare:workers";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const factory = createFactory();

type MessageContent = { type: "text"; text: string };
type Message = { role: "user" | "assistant"; content: MessageContent[] };

const sessionMessages: Record<string, Message[]> = {};

const SYSTEM_PROMPT = `You are a helpful conversation assistant. You should respond to the user's message in a conversational manner. Your output will be spoken by a TTS model. You should respond in a way that is easy for the TTS model to speak and sound natural.`;
const WELCOME_MESSAGE = "Welcome to Layercode. How can I help you today?";

export const onRequestPost = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      text: z.string(),
      type: z.string(),
      session_id: z.string(),
      turn_id: z.string(),
    })
  ),
  async (c) => {
    if (!env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return c.json({ error: "GOOGLE_GENERATIVE_AI_API_KEY is not set" }, 500);
    }
    const { text, type, session_id, turn_id } = c.req.valid("json");

    let messages = sessionMessages[session_id] || [];
    // Add user message
    messages.push({ role: "user", content: [{ type: "text", text }] });

    if (type === "session.start") {
      return streamSSE(c, async (stream) => {
        await stream.writeSSE({
          data: JSON.stringify({
            type: "response.tts",
            content: WELCOME_MESSAGE,
            turn_id,
          }),
        });
        messages.push({
          role: "assistant",
          content: [{ type: "text", text: WELCOME_MESSAGE }],
        });
        sessionMessages[session_id] = messages;
        await stream.writeSSE({
          data: JSON.stringify({ type: "response.end", turn_id }),
        });
      });
    }

    const google = createGoogleGenerativeAI({
      apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    return streamSSE(c, async (stream) => {
      const { textStream, response } = streamText({
        model: google("gemini-2.0-flash-001"),
        system: SYSTEM_PROMPT,
        messages,
        onFinish: async ({ response }) => {
          for (const msg of response.messages) {
            if (msg.role === "assistant") {
              // Normalize content to array of { type: "text", text: ... }
              let contentArr: { type: "text"; text: string }[] = [];
              if (typeof msg.content === "string") {
                contentArr = [{ type: "text", text: msg.content }];
              } else if (Array.isArray(msg.content)) {
                contentArr = msg.content.map((c: any) =>
                  typeof c === "string" ? { type: "text", text: c } : c
                );
              }
              messages.push({
                role: "assistant",
                content: contentArr,
              });
            }
          }
          sessionMessages[session_id] = messages;
          await stream.writeSSE({
            data: JSON.stringify({ type: "response.end", turn_id }),
          });
        },
      });
      await stream.writeSSE({
        data: JSON.stringify({
          textToBeShown: "Hello, how can I help you today?",
        }),
      });
      for await (const chunk of textStream) {
        await stream.writeSSE({
          data: JSON.stringify({
            type: "response.tts",
            content: chunk,
            turn_id,
          }),
        });
      }
    });
  }
);
