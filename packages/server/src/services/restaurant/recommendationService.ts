import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { GooglePlacesAPI } from "@langchain/community/tools/google_places";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { setupLangChainLogging } from "../../utils/logging/langchainLogger.ts";
import {
  RecommendationSchema,
  RecommendationsSchema,
  RecommendationsEnvelopeSchema,
  GetRestaurantRecommendationsRequestSchema,
  GetRestaurantRecommendationsResponseSchema,
} from "schema";

// Initialize LangChain logging configuration for Restaurant Recommendation Service
// Note: Handlers are created per-session in the function for better isolation

/**
 * Restaurant Recommendation Service
 *
 * This service provides personalized restaurant recommendations using:
 * - OpenAI GPT-4 for natural language processing
 * - Google Places API for location-based restaurant data
 * - LangChain agents for intelligent query processing
 *
 * The service requires user authentication and considers user preferences
 * and location to provide tailored restaurant suggestions with detailed information.
 */

// 1) Model configuration - will be instantiated per request
const baseModelConfig = {
  modelName: "gpt-4o",
  temperature: 0,
  verbose: true,
};

// 2) Tool - with better error handling
let placesTool: any;
let tools: any[] = [];

try {
  placesTool = new GooglePlacesAPI({
    apiKey: process.env.GOOGLE_PLACES_API_KEY,
  });
  tools = [placesTool];
  console.log("Google Places API tool initialized successfully");
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.warn("Failed to initialize Google Places API tool:", errorMessage);
  tools = [];
}

/**
 * Generate user profile string from user data
 * @param userData - User data object (required)
 * @returns {string} Formatted user profile string
 */
function generateUserProfile(userData: any) {
  if (!userData) {
    throw new Error("User data is required for personalized recommendations");
  }

  const {
    name = "User",
    email,
    monthlyBudget,
    monthlyIncome,
    expensePreferences = {},
    savingsGoals = {},
    lifestylePreferences = {},
  } = userData;

  let profile = `My name is ${name}.\n`;

  if (monthlyBudget) {
    profile += `My monthly budget is $${monthlyBudget}.\n`;
  }

  if (monthlyIncome) {
    profile += `My monthly income is $${monthlyIncome}.\n`;
  }

  // Add expense preferences
  if (expensePreferences.diningOut) {
    profile += `I prefer ${expensePreferences.diningOut} dining experiences.\n`;
  }

  if (
    expensePreferences.cuisineTypes &&
    Array.isArray(expensePreferences.cuisineTypes)
  ) {
    profile += `I enjoy ${expensePreferences.cuisineTypes.join(
      ", "
    )} cuisine.\n`;
  }

  // Add lifestyle preferences
  if (lifestylePreferences.diningStyle) {
    profile += `I prefer ${lifestylePreferences.diningStyle} dining environments.\n`;
  }

  if (lifestylePreferences.priceRange) {
    profile += `My preferred price range is ${lifestylePreferences.priceRange}.\n`;
  }

  // Fallback to basic profile if no meaningful data provided
  if (profile === `My name is ${name}.\n`) {
    profile = `My name is ${name}.
I am looking for restaurant recommendations.
I enjoy discovering new places to eat.`;
  }

  return profile;
}

// 3) Custom Prompt Template (no markdown code fences)
const customPromptTemplate = `
You are a witty and incredibly helpful local guide.
Your goal is to answer the user's question as accurately as possible.

CRITICAL: You MUST follow the ReAct format exactly. Never output markdown, never use code fences. Output.
- In the Final Answer, include only plain text. Do not use markdown links or formatting.
- For each place, append all the information about the place from the tool result.

You have access to the following tools:
{tools}
you can use keywords like "restaurant", "cafe", "dim sum", "hot pot", "ramen", etc. with location to find the best places.

User profile:
{user_profile}

IMPORTANT: When using the google_places tool:
- Always include cuisine or dish keywords from the user's query (e.g., "dim sum", "hot pot", "ramen").
- Include the word "restaurant" and city/area terms. Example Action Input: "dim sum restaurant San Gabriel Los Angeles".
- Prefer specific search terms over generic "restaurant" when cuisine/dish is mentioned.

To use a tool, use exactly this format (one per line):
Thought: your reasoning about whether to use a tool
Action: the tool name, must be one of [{tool_names}]
Action Input: the specific search query for Google Places
Observation: the tool result

When you have a response to say to the Human, or if you do not need to use a tool, you MUST use the format:
Thought: I now have all the information I need.
Final Answer: Provide the final recommendations list only (plain text; no code fences, no extra commentary, no markdown links). Include a plain Google Maps URL for each place.

Begin!

Question: {input}
{agent_scratchpad}
`;

/**
 * Get personalized restaurant recommendations using AI agent with Google Places integration.
 * @param {Object} requestData - The request data containing query and userData (required)
 * @returns {Promise<Object>} Object containing query, answer, and rawAnswer
 */
export async function getRestaurantRecommendations(requestData: any) {
  // Validate request data using Zod schema
  const validatedRequest =
    GetRestaurantRecommendationsRequestSchema.parse(requestData);
  const { query, userData } = validatedRequest;

  // Create a new logging session for this request
  const { handlers: sessionHandlers, markdownHandler: sessionMarkdownHandler } =
    setupLangChainLogging("Restaurant Recommendation Service");

  // Create model instance for this session
  const model = new ChatOpenAI(baseModelConfig);

  // Log the initial request details
  if (sessionMarkdownHandler) {
    sessionMarkdownHandler.logRequestDetails(query, userData);
  }

  // Generate user profile from provided data (required)
  const user_profile = generateUserProfile(userData);

  // Create the prompt from our custom string template
  const prompt = ChatPromptTemplate.fromTemplate(customPromptTemplate);

  // Create the agent
  const agent = await createReactAgent({
    llm: model,
    tools,
    prompt,
  });

  // Create the agent executor with session-specific logging
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true, // Enable verbose mode for detailed output
    callbacks: sessionHandlers,
  });
  console.log("query", query);

  const result = await agentExecutor.invoke(
    {
      input: query,
      user_profile: user_profile,
    },
    {
      callbacks: sessionHandlers, // Add session-specific logging handlers
    }
  );

  // Second pass: coerce to structured output with highest guarantees
  // @ts-ignore - Complex LangChain type inference causes deep instantiation
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
    (r: any) => {
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
          r.recommendation || `Try ${r.name} for a memorable dining experience`,
      };
    }
  );

  // Validate response using Zod schema
  const response = {
    query: query,
    answer: normalizedRecommendations,
    rawAnswer: result.output,
  };

  const validatedResponse =
    GetRestaurantRecommendationsResponseSchema.parse(response);

  // Finalize the markdown log with session summary
  if (sessionMarkdownHandler) {
    sessionMarkdownHandler.finalize();
  }

  return validatedResponse;
}
