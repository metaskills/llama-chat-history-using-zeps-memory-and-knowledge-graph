import { streamText } from "ai";
import { inquire } from "./shared/inquire.js";
import { model } from "./shared/models.js";

import { v4 as uuidv4 } from "uuid";
import { zep, getMessages } from "./shared/zep.js";

async function chat(newUserMessage: string) {
  const { messages }: any = await getMessages(sessionId, newUserMessage);
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
  await zep.memory.add(sessionId, {
    messages: [
      { roleType: "user", content: newUserMessage },
      { roleType: "assistant", content: fullResponse },
    ],
  });
}

const sessionId = uuidv4();

while (true) {
  const newUserMessage = await inquire();
  if (newUserMessage.toLowerCase() === "exit") break;
  await chat(newUserMessage);
}
