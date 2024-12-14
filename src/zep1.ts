import { streamText } from "ai";
import { inquire } from "./shared/inquire.js";
import { model } from "./shared/models.js";

import {
  zep,
  getOrAddUser,
  getOrAddSession,
  getMessages,
} from "./shared/zep.js";

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

const userId = "1";
const sessionId = "1";

await getOrAddUser({
  userId: userId,
  email: "ken@unremarkable.ai",
  firstName: "Ken",
  lastName: "Collins",
});

await getOrAddSession({
  sessionId: sessionId,
  userId: userId,
});

while (true) {
  const newUserMessage = await inquire();
  if (newUserMessage.toLowerCase() === "exit") break;
  await chat(newUserMessage);
}
