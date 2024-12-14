import { streamText } from "ai";
import { inquire } from "./shared/inquire.js";
import { model } from "./shared/models.js";
import { promises as fs } from "fs";

import {
  zep,
  getOrAddUser,
  getOrAddSession,
  getMessages,
  getStructuredData,
} from "./shared/zep.js";

import { zepFields } from "@getzep/zep-cloud";
import type { Message } from "@getzep/zep-cloud/api";

async function chat(newUserMessage: string) {
  const { messages }: any = await getMessages(sessionId, newUserMessage);
  const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
  const newUserMessages = newUserMessage.match(/[\s\S]{1,2000}/g) || [];
  const userMessages: Message[] = newUserMessages.map((chunk) => ({
    roleType: "user",
    content: chunk,
  }));
  const { context } = await zep.memory.add(sessionId, {
    messages: userMessages,
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
    maxTokens: 2000,
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
await chat(`Hi my name is Ken Collins, here is my resume.\n\n${myResume}`);

const data1 = await getStructuredData(sessionId, {
  candidateName: zepFields.text("The name of the candidate."),
  candidateTitle: zepFields.text("The earliest job title of the candidate."),
});
console.log("data1:", data1);

const data2 = await getStructuredData(sessionId, {
  job_title: zepFields.text("The title of the job held"),
  total_number_of_years_experience: zepFields.text(
    "The total number of years experience in the job title."
  ),
  skill_names: zepFields.text(
    "The names of the skills, provided as a comma-separated list"
  ),
});
console.log("data2:", data2);
