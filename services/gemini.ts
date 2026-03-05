import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIService, ChatMessage } from "../types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const geminiService: AIService = {
  name: "Gemini",
  async chat(messages: ChatMessage[]) {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        topP: 0.95,
      },
    });
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage?.content || "");

    return (async function* () {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) yield text;
      }
    })();
  },
};
