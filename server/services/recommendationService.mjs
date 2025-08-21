import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { GooglePlacesAPI } from "@langchain/community/tools/google_places";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

/**
 * Restaurant Recommendation Service
 *
 * This service provides personalized restaurant recommendations using:
 * - OpenAI GPT-4 for natural language processing
 * - Google Places API for location-based restaurant data
 * - LangChain agents for intelligent query processing
 *
 * The service considers user preferences and location to provide
 * tailored restaurant suggestions with detailed information.
 */

// 1) Model
const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0,
});

// 2) Tool
const placesTool = new GooglePlacesAPI({
  apiKey: process.env.GOOGLE_PLACES_API_KEY,
});
const tools = [placesTool];

// Structured output schema (second pass coercion)
const RecommendationSchema = z.object({
  name: z.string().describe("The restaurant name"),
  address: z.string().describe("The full street address of the restaurant"),
  phone: z
    .string()
    .optional()
    .default("")
    .describe("The restaurant's phone number"),
  website: z
    .string()
    .optional()
    .default("")
    .describe("The restaurant's website URL"),
  googleMapsLink: z
    .string()
    .optional()
    .default("")
    .describe(
      [
        "Google Maps link to the restaurant location.",
        "Use both the search query and the place id to construct the link.",
        "e.g., https://www.google.com/maps/search/?api=1&query=Some+Place&query_place_id=ChIJN1t_tDeuEmsRUsoyG83frY4"
      ].join(" ")
    ),
  googleMapsLinkDescription: z
    .string()
    .optional()
    .default("")
    .describe("Description for the Google Maps link"),
  reason: z
    .string()
    .describe("Why this restaurant is recommended based on user preferences"),
  recommendation: z
    .string()
    .describe("Specific recommendation or tip about this restaurant"),
  cuisine: z.string().optional().default("").describe("Type of cuisine served"),
  priceRange: z
    .string()
    .optional()
    .default("")
    .describe("Price range (e.g., $, $$, $$$, $$$$)"),
  rating: z.string().optional().default("").describe("Average rating if known"),
  hours: z.string().optional().default("").describe("Operating hours if known"),
  specialFeatures: z
    .string()
    .optional()
    .default("")
    .describe("Special features like outdoor seating, live music, etc."),
});
const RecommendationsSchema = z.array(RecommendationSchema);
const RecommendationsEnvelopeSchema = z.object({
  recommendations: RecommendationsSchema,
});

const user_profile = `
My name is John Doe.
I am a 30-year-old male.
I live in Los Angeles, CA.
I am a software engineer.
I am a coffee lover.
I am a seafood lover.
I am a quiet person.
`;

// 3) Custom Prompt Template (no markdown code fences)
const customPromptTemplate = `
You are a witty and incredibly helpful local guide for Los Angeles.
Your goal is to answer the user's question as accurately as possible.

CRITICAL: You MUST follow the ReAct format exactly. Never output markdown, never use code fences, never use [Google Maps] links.
Output ONLY plain text in the exact format specified below.

You have access to the following tools:
{tools}

User profile:
{user_profile}

IMPORTANT: When using the google_places tool, be as specific as possible. Include keywords from the user's request like "chain," "cafe," "restaurant," etc., in your Action Input to get the best results.

To use a tool, use exactly this format (one per line):
Thought: your reasoning about whether to use a tool
Action: the tool name, must be one of [{tool_names}]
Action Input: the specific search query for Google Places
Observation: the tool result

When you have a response to say to the Human, or if you do not need to use a tool, you MUST use the format:
Thought: I now have all the information I need.
Final Answer: Provide the final recommendations list only (no code fences, no extra commentary, no markdown links).

For any place, you should attach a google maps link to the place.

Begin!

Question: {input}
Thought: {agent_scratchpad}
`;

/**
 * Get personalized restaurant recommendations using AI agent with Google Places integration.
 * @param {string} query - The search query for restaurant recommendations
 * @returns {Promise<Object>} Object containing query, answer, and steps
 */
export async function getRestaurantRecommendations(query) {
  try {
    // Create the prompt from our custom string template
    const prompt = ChatPromptTemplate.fromTemplate(customPromptTemplate);

    // Create the agent
    const agent = await createReactAgent({
      llm: model,
      tools,
      prompt,
    });

    // Create the agent executor
    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      verbose: true,
    });

    let result;
    try {
      result = await agentExecutor.invoke({
        input: query,
        user_profile: user_profile,
      });
    } catch (agentErr) {
      // Fallback: If agent parsing or tools fail, generate a direct answer (no tools)
      const fallback = await model.invoke([
        {
          role: "system",
          content:
            "You are a helpful restaurant guide. Output plain text only. Do not use code fences.",
        },
        {
          role: "user",
          content: `Given the user profile and the question, provide a concise list of 3-5 restaurants with name, address, phone, website (if known), and a short reason and recommendation. If you do not know a field, leave it empty.\n\nUser profile:\n${user_profile}\n\nQuestion:\n${query}`,
        },
      ]);
      result = {
        output: String(fallback.content || "[]"),
        intermediateSteps: [],
      };
    }

    // Second pass: coerce to structured output with highest guarantees
    const structuredModel = model.withStructuredOutput(
      RecommendationsEnvelopeSchema
    );
    const envelope = await structuredModel.invoke(
      "Extract a detailed list of restaurant recommendations from the following assistant answer. " +
        "Return ONLY a JSON object with a 'recommendations' array where each item has: " +
        "name, address, phone, website, googleMapsLink, reason, recommendation, cuisine, priceRange, rating, hours, specialFeatures. " +
        "For each field, provide detailed information when available. If a field is unknown, leave it as an empty string. " +
        "Make the reason and recommendation fields detailed and personalized based on the user profile.\n\nAnswer:\n" +
        String(result.output)
    );

    // Normalize: always compute a precise Google Maps link and description
    const normalizedRecommendations = (envelope?.recommendations || []).map(
      (r) => {
        const q = [r.name, r.address].filter(Boolean).join(" ");
        const computedLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          q
        )}`;
        return {
          ...r,
          googleMapsLink: computedLink,
          googleMapsLinkDescription: `Open Google Maps for ${r.name}`,
          // Ensure all optional fields have default values
          phone: r.phone || "",
          website: r.website || "",
          cuisine: r.cuisine || "",
          priceRange: r.priceRange || "",
          rating: r.rating || "",
          hours: r.hours || "",
          specialFeatures: r.specialFeatures || "",
          reason: r.reason || `Great choice for ${r.name}`,
          recommendation:
            r.recommendation ||
            `Try ${r.name} for a memorable dining experience`,
        };
      }
    );

    return {
      query: query,
      answer: normalizedRecommendations,
      rawAnswer: result.output,
      steps: result.intermediateSteps,
    };
  } catch (err) {
    console.error("Agent flow failed:", err?.message || err);
    throw new Error("Failed to get restaurant recommendations");
  }
}
