import { cerebrasService } from "./services/cerebras";
import { geminiService } from "./services/gemini";
import { groqService } from "./services/groq";
import { openrouterService } from "./services/openrouter";
import type { AIService, ChatMessage } from "./types";

const services: AIService[] = [groqService, cerebrasService, openrouterService, geminiService];

let currentServiceIndex = 0;

function getNextService() {
  const service = services[currentServiceIndex];
  currentServiceIndex = (currentServiceIndex + 1) % services.length;
  return service;
}

const server = Bun.serve({
  port: process.env.PORT ?? 3000,
  async fetch(req) {
    const { pathname } = new URL(req.url);

    if (req.method === "POST" && pathname === "/chat") {
      const { messages } = (await req.json()) as { messages: ChatMessage[] };
      const service = getNextService();
      console.log(`Using service: ${service?.name}`);
      const stream = await service?.chat(messages);

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else if (req.method === "GET" && pathname === "/services") {
      return new Response(JSON.stringify(services.map((s) => s.name)), {
        headers: { "Content-Type": "application/json" },
      });
    } else if (req.method === "GET" && pathname === "/health") {
      return new Response("OK", { status: 200 });
    } else if (req.method === "GET" && pathname === "/") {
      return new Response("Hello world", { status: 200 });
    }
    return new Response("Not found", { status: 404 });
  },
});

console.log(`Servidor corriendo en ${server.url}`);
