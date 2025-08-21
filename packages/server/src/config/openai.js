import dotenv from "dotenv";

dotenv.config();

const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
  timeout: parseInt(process.env.OPENAI_TIMEOUT) || 30000,
};

export default openaiConfig;
