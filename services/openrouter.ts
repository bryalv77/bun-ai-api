import OpenAI from "openai";
import type { AIService, ChatMessage } from "../types";

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const openrouterService: AIService = {
  name: "OpenRouter",
  async chat(messages: ChatMessage[]) {
    const chatCompletion = await openrouter.chat.completions.create({
      messages,
      model: "meta-llama/llama-3.1-8b-instruct:free",
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      stream: true,
    });
    return (async function* () {
      for await (const chunk of chatCompletion) {
        yield chunk.choices[0]?.delta?.content || "";
      }
    })();
  },
};
