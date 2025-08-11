import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { GooglePlacesAPI } from "@langchain/community/tools/google_places";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

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
const placesTool = new GooglePlacesAPI();
const tools = [placesTool];

const user_profile = `
My name is John Doe.
I am a 30-year-old male.
I live in Los Angeles, CA.
I am a software engineer.
I am a coffee lover.
I am a seafood lover.
I am a quiet person.
`;

// 3) Custom Prompt Template
const customPromptTemplate = `
You are a witty and incredibly helpful local guide for Los Angeles.
Your goal is to answer the user's question as accurately as possible.

You have access to the following tools:
{tools}

User profile:
{user_profile}

**IMPORTANT:** When using the google_places tool, be as specific as possible. Include keywords from the user's request like "chain," "cafe," "restaurant," etc., in your Action Input to get the best results.

To use a tool, use the following format:
\`\`\`
Thought: Do I need to use a tool? Yes. I will formulate a specific search query for the google_places tool, including key details from the user's question.
Action: The name of the tool to use, which must be one of [{tool_names}]
Action Input: A specific and detailed search query for Google Places.
Observation: The result of the tool.
\`\`\`

When you have a response to say to the Human, or if you do not need to use a tool, you MUST use the format:
\`\`\`
Thought: I now have all the information I need. I will filter the results to match the user's original request and format the answer.
Final Answer: [Your final response here, formatted as a numbered list]
\`\`\`

For any place, you should attach a google maps link to the place.

output format: 
\`\`\`
[
  {{
    "name": "NBC seafood restaurant",
    "address": "123 Main St, Los Angeles, CA 90012",
    "phone": "123-456-7890",
    "website": "https://www.nbcseafood.com",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query={{encodeURIComponent(name)}}&query_place_id={{place_id}}",
    "reason": "xxxx",
    "recommendation": "xxxx"
  }},
  {{
    "name": "NBC seafood restaurant",
    "address": "123 Main St, Los Angeles, CA 90012",
    "phone": "123-456-7890",
    "website": "https://www.nbcseafood.com",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query={{encodeURIComponent(name)}}&query_place_id={{place_id}}",
    "reason": "xxxx",
    "recommendation": "xxxx"
  }}
]
\`\`\`

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

    const result = await agentExecutor.invoke({
      input: query,
      user_profile: user_profile,
    });

    return {
      query: query,
      answer: result.output,
      steps: result.intermediateSteps,
    };
  } catch (err) {
    console.error(err);
    throw new Error(`Agent search failed: ${err.message}`);
  }
}
