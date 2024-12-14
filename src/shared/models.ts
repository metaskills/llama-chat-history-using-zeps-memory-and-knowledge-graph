import type { LanguageModel } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";

const sambanova = createOpenAI({
  name: "sambanova",
  apiKey: process.env.SAMBANOVA_API_KEY,
  baseURL: "https://api.sambanova.ai/v1",
})("Meta-Llama-3.2-3B-Instruct");

const lmstudio = createOpenAI({
  name: "lmstudio",
  baseURL: "http://localhost:1234/v1",
})("llama-3.2-3b-instruct");

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})("llama-3.2-3b-preview");

const models: { [key: string]: LanguageModel } = { sambanova, lmstudio, groq };
const model = process.env.MODEL ? models[process.env.MODEL] : sambanova;

export { model, groq, lmstudio };
