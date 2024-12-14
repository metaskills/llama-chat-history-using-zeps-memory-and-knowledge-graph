import { streamText } from "ai";
import { inquire } from "./shared/inquire.js";
import { model } from "./shared/models.js";
import { promises as fs } from "fs";

import {
  zep,
  getOrAddUser,
  getOrAddSession,
  getMessages,
} from "./shared/zep.js";

async function chat(newUserMessage: string) {
  const { messages }: any = await getMessages(sessionId, newUserMessage);
  const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
  const { context } = await zep.memory.add(sessionId, {
    messages: [{ roleType: "user", content: newUserMessage }],
    returnContext: true,
  });
  const stream = streamText({
    model: model,
    system: `
You are a helpful personal assistant. Use the following private facts and entities, which include timestamps, to inform your responses. Utilize the timestamps to ensure information is accurate and relevant, but do not mention or reference the facts, entities, or timestamps to the user in any way.

${context}

The current time is ${timestamp}.
`.trim(),
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
    messages: [{ roleType: "assistant", content: fullResponse }],
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

const myResume = await fs.readFile("./resumes/ken.md", "utf-8");
await zep.graph.add({
  userId: userId,
  type: "text",
  data: myResume,
});

while (true) {
  const newUserMessage = await inquire();
  if (newUserMessage.toLowerCase() === "exit") break;
  await chat(newUserMessage);
}
