import { ZepClient } from "@getzep/zep-cloud";
import type {
  Message,
  Memory,
  Question,
  CreateUserRequest,
  CreateSessionRequest,
  GraphSearchResults,
} from "@getzep/zep-cloud/api";

import { SupportedZepField } from "@getzep/zep-cloud/extractor";

const zep = new ZepClient({
  apiKey: process.env.ZEP_API_KEY,
});

async function getOrAddUser(r: CreateUserRequest) {
  let user;
  try {
    user = await zep.user.get(r.userId!);
  } catch (error: any) {
    if (error.statusCode === 404) {
      user = await zep.user.add(r);
    } else {
      throw error;
    }
  }
  return user;
}

async function getOrAddSession(r: CreateSessionRequest) {
  let session;
  try {
    session = await zep.memory.getSession(r.sessionId!);
  } catch (error: any) {
    if (error.statusCode === 404) {
      session = await zep.memory.addSession(r);
    } else {
      throw error;
    }
  }
  return session;
}

async function getQuestion(sessionId: string) {
  const question: Question = await zep.memory.synthesizeQuestion(sessionId);
  if (process.env.DEBUG) {
    console.log("question.question:\n", question.question, "\n\n");
  }
  return question;
}

async function getMemory(sessionId: string) {
  const memory: Memory = await zep.memory.get(sessionId);
  if (process.env.DEBUG) {
    console.log("memory.context:\n", memory.context, "\n\n");
    console.log("memory.relevantFacts:\n", memory.relevantFacts, "\n\n");
    console.log("memory.summary:\n", memory.summary, "\n\n");
  }
  return { memory };
}

async function getMessages(sessionId: string, newUserMessage: string) {
  const { memory } = await getMemory(sessionId);
  const messages = memory.messages!.map((m: Message) => {
    return { role: m.roleType, content: m.content };
  });
  messages.push({ role: "user", content: newUserMessage });
  return { memory, messages };
}

async function getGraphSearch(userId: string, query: string) {
  const searchResults: GraphSearchResults = await zep.graph.search({
    userId: userId,
    query: query,
  });
  if (process.env.DEBUG) {
    console.log("searchResults:\n", JSON.stringify(searchResults, null, 2));
  }
  searchResults.edges!.forEach((edge) => {
    console.log(`- ${edge.fact}`);
  });
  return searchResults;
}

async function getStructuredData(
  sessionId: string,
  schema: Record<string, SupportedZepField>
) {
  return await zep.memory.extract(sessionId, schema, {
    lastN: 10,
    validate: false,
  });
}

export {
  zep,
  getOrAddUser,
  getOrAddSession,
  getQuestion,
  getMemory,
  getMessages,
  getGraphSearch,
  getStructuredData,
};
