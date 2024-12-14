import { streamText } from "ai";
import { inquire } from "./shared/inquire.js";
import { model } from "./shared/models.js";
import { promises as fs } from "fs";

import {
  zep,
  getOrAddUser,
  getOrAddSession,
  getMessages,
  getGraphSearch,
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

The current time is ${timestamp}.`.trim(),
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
  factRatingInstruction: {
    instruction:
      "Rate the facts by how well they demonstrate skills relevant to a specific job role/title at a particular point in someone's career history. Highly relevant facts show mastery of role-specific skills with clear context of when and how they were applied. Medium relevant facts indicate general capabilities related to the role but lack specific timing or application. Low relevant facts mention skills without clear connection to role or career timeline.",
    examples: {
      high: "As Principal Engineer at Custom Ink (2017-2020), the candidate led the mobile transformation of the Design Lab, resulting in a 35% increase in mobile saves and 20% rise in mobile orders through strategic leaadership and techncial responsive design innovation, setting the foundation for the company's future Design Lab platform",
      medium:
        "While at Custom Ink, the candidate gained experience with AWS Lambda and Cloud Architecture skills.",
      low: "The candidate knows CSS and HTML.",
    },
  },
});

const myResume = await fs.readFile("./resumes/ken.json", "utf-8");
await zep.graph.add({
  userId: userId,
  type: "json",
  data: myResume,
});

await new Promise((resolve) => setTimeout(resolve, 60000));
// await getGraphSearch(userId, "What skills does the candidate have with GenAI?");
await chat("Hi my name is Ken Collins.");
await getGraphSearch(userId, "What skills did the candidate gain at Decisiv?");

while (true) {
  const newUserMessage = await inquire();
  if (newUserMessage.toLowerCase() === "exit") break;
  await chat(newUserMessage);
}
