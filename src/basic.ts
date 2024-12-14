import { streamText } from "ai";
import { inquire } from "./shared/inquire.js";
import { model } from "./shared/models.js";

const messages: any[] = [];

async function chat(newUserMessage: string) {
  messages.push({ role: "user", content: newUserMessage });
  const stream = streamText({
    model: model,
    system: "You are a helpful assistant.",
    messages: messages,
    temperature: 0.1,
    maxTokens: 1000,
  });
  let fullResponse = "";
  for await (const chunk of stream.textStream) {
    process.stdout.write(chunk);
    fullResponse += chunk;
  }
  process.stdout.write("\n\n");
  messages.push({ role: "assistant", content: fullResponse });
}

while (true) {
  const newUserMessage = await inquire();
  if (newUserMessage.toLowerCase() === "exit") break;
  await chat(newUserMessage);
}
