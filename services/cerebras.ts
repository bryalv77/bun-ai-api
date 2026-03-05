import Cerebras from "@cerebras/cerebras_cloud_sdk";
import type { AIService, ChatMessage } from "../types";
const cerebras = new Cerebras();

export const cerebrasService = {
  name: "Cerebras",
  async chat(messages: ChatMessage[]) {
    const chatCompletion = await cerebras.chat.completions.create({
      messages: messages as any,
      model: "zai-glm-4.7",
      temperature: 1,
      max_completion_tokens: 65000,
      top_p: 0.95,
      stream: true,
      stop: null,
    });
    return (async function* () {
      for await (const chunk of chatCompletion) {
        yield (chunk as any).choices[0]?.delta?.content || "";
      }
    })();
  },
};
