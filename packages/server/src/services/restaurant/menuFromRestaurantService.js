import "dotenv/config";
import OpenAI from "openai";
import { selectMenuPhoto } from "./menuPhotoFilter.js";

const ROOT = "https://places.googleapis.com/v1";
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

function headers(fieldMask) {
  const h = { "X-Goog-Api-Key": API_KEY };
  if (fieldMask) h["X-Goog-FieldMask"] = fieldMask;
  return h;
}

/**
 * Get place details from Google Places API
 * @param {string} placeId - Google Places place_id
 * @returns {Promise<Object>} Place details with photos
 */
export async function getPlace(placeId) {
  if (!API_KEY) {
    throw new Error("Google Places API key not configured");
  }

  const url = `${ROOT}/places/${encodeURIComponent(placeId)}`;
  const res = await fetch(url, {
    headers: headers("id,displayName,formattedAddress,googleMapsUri,photos"),
  });

  if (!res.ok) throw new Error(`getPlace failed: ${res.status}`);
  return await res.json();
}

/**
 * Download photo buffer from Google Places API
 * @param {string} photoName - Photo name/ID from Google Places
 * @param {number} maxWidthPx - Maximum width for the photo
 * @returns {Promise<Object>} Object with buffer and mime type
 */
export async function downloadPhotoBuffer(photoName, maxWidthPx = 1600) {
  if (!API_KEY) {
    throw new Error("Google Places API key not configured");
  }

  const url = `${ROOT}/${photoName}/media?maxWidthPx=${maxWidthPx}`;
  const res = await fetch(url, { headers: headers() });

  if (!res.ok) throw new Error(`downloadPhoto failed: ${res.status}`);
  const mime = res.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await res.arrayBuffer());

  return { buffer, mime };
}

// Lightweight AI judge (optional; auto-disabled if no OPENAI_API_KEY)
async function aiJudge(buffer, mime) {
  if (!openai) return { isMenu: false, confidence: 0, reason: "ai_disabled" };

  const b64 = buffer.toString("base64");
  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: 'Is this a restaurant MENU photo? Reply JSON: {"isMenu": true|false, "confidence": 0..1, "reason": "..."}',
          },
          {
            type: "image_url",
            image_url: { url: `data:${mime};base64,${b64}` },
          },
        ],
      },
    ],
  });

  try {
    const txt = resp.choices?.[0]?.message?.content || "";
    return JSON.parse(txt);
  } catch {
    return { isMenu: false, confidence: 0, reason: "parse_failed" };
  }
}

// High-level: choose a menu photo with two-stage strategy
export async function chooseMenuPhotoWithAi(
  photos,
  {
    heuristicThreshold = 70,
    aiThreshold = 0.6,
    topK = 5,
    candidateLimit = 6,
    ocrScores, // optional, can be undefined
  } = {}
) {
  return await selectMenuPhoto(photos, {
    fetchThumb: (p) => downloadPhotoBuffer(p.name, 512), // small thumbnail for AI
    aiJudge: openai ? aiJudge : undefined, // inject only if AI is enabled
    heuristicThreshold,
    aiThreshold,
    topK,
    candidateLimit,
    ocrScores,
  });
}

/**
 * Get restaurant photos and pick the most likely menu photo
 * @param {string} placeId - Google Places place_id
 * @returns {Promise<Object>} Object with place details and selected photo
 */
export async function getRestaurantPhotos(placeId) {
  try {
    const place = await getPlace(placeId);

    if (!place.photos || place.photos.length === 0) {
      return {
        place: {
          id: place.id,
          name: place.displayName?.text || place.displayName || "",
          address: place.formattedAddress || "",
        },
        photos: [],
        selectedPhoto: null,
      };
    }

    // Use the new two-stage selection
    const selection = await chooseMenuPhotoWithAi(place.photos);

    return {
      place: {
        id: place.id,
        name: place.displayName?.text || place.displayName || "",
        address: place.formattedAddress || "",
      },
      photos: place.photos,
      selection,
    };
  } catch (error) {
    console.error("Error fetching restaurant photos:", error);
    throw error;
  }
}
