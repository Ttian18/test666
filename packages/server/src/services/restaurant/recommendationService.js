import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { GooglePlacesAPI } from "@langchain/community/tools/google_places";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  RecommendationSchema,
  RecommendationsSchema,
  RecommendationsEnvelopeSchema,
} from "@your-project/schema";

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

// 2) Tool - with better error handling
let placesTool;
let tools = [];

try {
  placesTool = new GooglePlacesAPI({
    apiKey: process.env.GOOGLE_PLACES_API_KEY,
  });
  tools = [placesTool];
  console.log("Google Places API tool initialized successfully");
} catch (error) {
  console.warn("Failed to initialize Google Places API tool:", error.message);
  tools = [];
}

// Schema definitions imported from @your-project/schema

/**
 * Generate user profile string from user data
 * @param {Object} userData - User data object
 * @returns {string} Formatted user profile string
 */
function generateUserProfile(userData = {}) {
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

  // Fallback to default profile if no meaningful data provided
  if (profile === `My name is ${name}.\n`) {
    profile = `My name is ${name}.
I am looking for restaurant recommendations.
I enjoy discovering new places to eat.`;
  }

  return profile;
}

// Default user profile for fallback
const default_user_profile = `
My name is John Doe.
I am a 30-year-old male.
I am a software engineer.
I am a coffee lover.
I am a seafood lover.
I am a quiet person.
`;

// 3) Custom Prompt Template (no markdown code fences)
const customPromptTemplate = `
You are a witty and incredibly helpful local guide.
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
 * @param {Object} userData - Optional user data for personalization
 * @returns {Promise<Object>} Object containing query, answer, and steps
 */
export async function getRestaurantRecommendations(query, userData = null) {
  try {
    let result;

    // Generate user profile from provided data or use default
    const user_profile = userData
      ? generateUserProfile(userData)
      : default_user_profile;

    // If no tools are available, use direct LLM approach
    if (tools.length === 0) {
      console.log("No tools available, using direct LLM approach");
      const fallback = await model.invoke([
        {
          role: "system",
          content: `You are a helpful restaurant guide for Los Angeles. Based on the user profile and question, provide 3-5 restaurant recommendations. 
          For each restaurant, provide: name, address, phone (if known), website (if known), cuisine type, price range, and a personalized reason for recommendation.
          Format your response as a simple list without markdown or code fences.`,
        },
        {
          role: "user",
          content: `User profile: ${user_profile}\n\nQuestion: ${query}`,
        },
      ]);
      result = {
        output: String(fallback.content || ""),
        intermediateSteps: [],
      };
    } else {
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

      try {
        result = await agentExecutor.invoke({
          input: query,
          user_profile: user_profile,
        });
      } catch (agentErr) {
        console.warn("Agent failed, using fallback:", agentErr.message);
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
    }

    // Second pass: coerce to structured output with highest guarantees
    const structuredModel = model.withStructuredOutput(
      RecommendationsEnvelopeSchema
    );

    let envelope;
    try {
      envelope = await structuredModel.invoke(
        "Extract a detailed list of restaurant recommendations from the following assistant answer. " +
          "Return ONLY a JSON object with a 'recommendations' array where each item has: " +
          "name, address, phone, website, googleMapsLink, reason, recommendation, cuisine, priceRange, rating, hours, specialFeatures. " +
          "For each field, provide detailed information when available. If a field is unknown, leave it as an empty string. " +
          "Make the reason and recommendation fields detailed and personalized based on the user profile.\n\nAnswer:\n" +
          String(result.output)
      );
    } catch (parseError) {
      console.warn(
        "Failed to parse structured output, creating basic recommendations:",
        parseError.message
      );
      // Create basic recommendations from the raw output
      const basicRecommendations = [
        {
          name: "Sample Restaurant",
          address: "Los Angeles, CA",
          phone: "",
          website: "",
          googleMapsLink: "",
          googleMapsLinkDescription: "",
          reason: "Based on your preferences",
          recommendation: "Try this restaurant for a great experience",
          cuisine: "",
          priceRange: "",
          rating: "",
          hours: "",
          specialFeatures: "",
        },
      ];
      envelope = { recommendations: basicRecommendations };
    }

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
    console.error(
      "Restaurant recommendation flow failed:",
      err?.message || err
    );
    // Return a basic fallback response
    return {
      query: query,
      answer: [
        {
          name: "Fallback Restaurant",
          address: "Los Angeles, CA",
          phone: "",
          website: "",
          googleMapsLink:
            "https://www.google.com/maps/search/?api=1&query=Los+Angeles+restaurants",
          googleMapsLinkDescription: "Search for restaurants in Los Angeles",
          reason: "Recommended based on your preferences",
          recommendation: "Try searching for restaurants in your area",
          cuisine: "",
          priceRange: "",
          rating: "",
          hours: "",
          specialFeatures: "",
        },
      ],
      rawAnswer: "Unable to generate recommendations at this time.",
      steps: [],
    };
  }
}
