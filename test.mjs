import "dotenv/config";

// LangChain: OpenAI model + Google Places tool + simple agent
import { OpenAI } from "@langchain/openai";
import { GooglePlacesAPI } from "@langchain/community/tools/google_places";
// 1) Model (OpenAI via LangChain)
const model = new OpenAI({
  temperature: 0, // deterministic
  // apiKey is read from process.env.OPENAI_API_KEY
});

// 2) Tool (Google Places)
const placesTool = new GooglePlacesAPI({
  // By default it reads process.env.GOOGLE_PLACES_API_KEY
  // You could pass { apiKey: '...' } explicitly if you prefer.
});

/**
 * Search for places using Google Places API via LangChain agent
 * @param {string} query - The search query (e.g., "Find coffee near Stanford")
 * @returns {Promise<Object>} Object containing query, answer, and steps
 */
export async function searchPlaces(query = "Find coffee near UCLA") {
  try {
    // Use the places tool directly
    const result = await placesTool.invoke(query);

    return {
      query: query,
      answer: result,
      steps: null, // No intermediate steps when using tool directly
    };
  } catch (err) {
    console.error(err);
    throw new Error(`Places search failed: ${err.message}`);
  }
}

/**
 * Get detailed information about a specific place by its ID
 * @param {string} placeId - The Google Places ID (e.g., "ChIJ_-Eb1R67woAR-PhKp3x-_DY")
 * @returns {Promise<Object>} Object containing place details
 */
export async function getPlaceDetails(placeId) {
  try {
    // Since the LangChain tool doesn't support direct place ID lookups,
    // we'll return a message indicating this limitation
    return {
      placeId: placeId,
      details:
        "Direct place ID lookup not supported with current LangChain Google Places tool. Use searchPlaces() to get place information.",
      note: "The LangChain Google Places tool only supports text-based searches, not direct place ID lookups.",
    };
  } catch (err) {
    console.error(err);
    throw new Error(`Place details lookup failed: ${err.message}`);
  }
}

/**
 * Get details for a specific place by name and location
 * @param {string} placeName - The name of the place (e.g., "Bonsai Coffee & Bar")
 * @param {string} location - The location context (e.g., "Los Angeles, CA")
 * @returns {Promise<Object>} Object containing place details
 */
export async function getPlaceDetailsByName(
  placeName,
  location = "Los Angeles, CA"
) {
  try {
    const searchQuery = `${placeName} ${location}`;
    const result = await placesTool.invoke(searchQuery);

    return {
      placeName: placeName,
      location: location,
      details: result,
    };
  } catch (err) {
    console.error(err);
    throw new Error(`Place details lookup failed: ${err.message}`);
  }
}

// Example usage (uncomment to test):
// searchPlaces("Find coffee near Stanford").then(console.log).catch(console.error);

// Test 1: Search for places
console.log("=== Testing searchPlaces ===");
searchPlaces("Find coffee near 90025").then(console.log).catch(console.error);

// Test 2: Try to get place details by ID (will show limitation)
// console.log("\n=== Testing getPlaceDetails (shows limitation) ===");
// getPlaceDetails("ChIJ6Rw9UD67woARJchEWlqsBTw")
//   .then(console.log)
//   .catch(console.error);

// Test 3: Get place details by name
// console.log("\n=== Testing getPlaceDetailsByName ===");
// getPlaceDetailsByName("Bonsai Coffee & Bar", "Los Angeles, CA")
//   .then(console.log)
//   .catch(console.error);
