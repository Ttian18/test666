import "dotenv/config";
import OpenAI from "openai";
import { selectMenuPhoto } from "./menuPhotoFilter";
import MenuAnalysisController from "./menuAnalysisController";
import menuAnalysisCache from "../../utils/cache/menuAnalysisCache";
import { normalizeTags, tagsHash } from "../../utils/tagsUtils";
import { normalizeCalories, caloriesHash } from "../../utils/caloriesUtils";
import { extractTextFromImage } from "../../utils/ocr/ocrUtils";

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
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Return ONLY JSON with keys isMenu(boolean), confidence(0..1), reason(string).",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Is this a RESTAURANT MENU photo? Reply valid JSON only.",
          },
          {
            type: "image_url",
            image_url: { url: `data:${mime};base64,${b64}` },
          },
        ],
      },
    ],
  });

  let txt = (resp.choices?.[0]?.message?.content || "").trim();
  let parsed;

  try {
    parsed = JSON.parse(txt);
  } catch {
    try {
      // Try to extract JSON from the response if it's wrapped in other text
      const jsonMatch = txt.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = { isMenu: false, confidence: 0, reason: "parse_failed" };
      }
    } catch {
      parsed = { isMenu: false, confidence: 0, reason: "parse_failed" };
    }
  }

  // Ensure required fields exist
  return {
    isMenu: Boolean(parsed.isMenu),
    confidence: Number(parsed.confidence) || 0,
    reason: String(parsed.reason || "no_reason_provided"),
  };
}

// High-level: choose a menu photo with two-stage strategy
export async function chooseMenuPhotoWithAi(
  photos,
  {
    heuristicThreshold = 70,
    aiThreshold = 0.6,
    topK = 5,
    candidateLimit = 6,
    useOCR = true, // whether to run OCR on photos
  } = {}
) {
  // Prepare OCR data if requested
  let ocrData = {};
  if (useOCR) {
    try {
      // Run OCR on top photos for better selection
      const topPhotos = photos.slice(0, Math.min(topK * 2, photos.length));
      for (const photo of topPhotos) {
        try {
          const { buffer } = await downloadPhotoBuffer(photo.name, 512);
          const ocrResult = await extractTextFromImage(buffer, 2000);
          ocrData[photo.name] = {
            priceHits: ocrResult.priceHits,
            menuKeywords: ocrResult.menuKeywords,
          };
        } catch (error) {
          console.warn(`OCR failed for photo ${photo.name}:`, error.message);
          ocrData[photo.name] = { priceHits: 0, menuKeywords: [] };
        }
      }
    } catch (error) {
      console.warn("OCR preparation failed:", error.message);
    }
  }

  return await selectMenuPhoto(photos, {
    fetchThumb: (p) => downloadPhotoBuffer(p.name, 512), // small thumbnail for AI
    aiJudge: openai ? aiJudge : undefined, // inject only if AI is enabled
    heuristicThreshold,
    aiThreshold,
    topK,
    candidateLimit,
    ocrData,
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
          name: place.displayName?.text ?? String(place.displayName ?? ""),
          address: place.formattedAddress || "",
        },
        photos: [],
        selection: {
          decision: "no_photos",
          pickedPhoto: null,
          candidates: [],
          metadata: { reason: "No photos available" },
        },
      };
    }

    // Use the new two-stage selection
    const selection = await chooseMenuPhotoWithAi(place.photos);

    return {
      place: {
        id: place.id,
        name: place.displayName?.text ?? String(place.displayName ?? ""),
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

/**
 * Get menu recommendation from place with complete flow
 * @param {string} placeId - Google Places place_id
 * @param {number} budget - Budget amount
 * @param {string} userNote - User note
 * @param {string} photoName - Optional specific photo to use
 * @returns {Promise<Object>} Complete recommendation result
 */
export async function getMenuRecommendationFromPlace(
  placeId,
  budget,
  userNote = "",
  photoName = null,
  tags = null,
  calories = null
) {
  try {
    // Fetch place details and photos
    const place = await getPlace(placeId);

    if (!place.photos || place.photos.length === 0) {
      throw new Error("No photos found for this restaurant");
    }

    // Normalize place data
    const normalizedPlace = {
      id: place.id,
      name: place.displayName?.text ?? String(place.displayName ?? ""),
      address: place.formattedAddress || "",
    };

    // Choose photo: use provided photoName or run selection
    let selectedPhoto;
    let selection;

    if (photoName) {
      // Use specified photo
      selectedPhoto = place.photos.find((photo) => photo.name === photoName);
      if (!selectedPhoto) {
        throw new Error("Specified photo not found");
      }
      selection = {
        decision: "manual",
        pickedPhoto: selectedPhoto,
        pickedConfidence: 1.0,
        candidates: [],
        metadata: { reason: "User specified photo" },
      };
    } else {
      // Run automatic selection
      selection = await chooseMenuPhotoWithAi(place.photos);

      if (selection.decision === "undecided") {
        // Return undecided result for UI selection
        return {
          undecided: true,
          candidates: selection.candidates,
          selection,
          place: normalizedPlace,
        };
      }

      selectedPhoto = selection.pickedPhoto;
      if (!selectedPhoto) {
        throw new Error("No suitable menu photo found");
      }
    }

    // Download the selected photo
    const { buffer: imageBuffer, mime: imageMimeType } =
      await downloadPhotoBuffer(selectedPhoto.name);

    // Normalize tags and compute signature
    const normalizedTags = normalizeTags(tags);
    const tagsSig = tagsHash(normalizedTags);

    // Normalize calories and compute signature
    const normalizedCalories = normalizeCalories(calories);
    const calSig = caloriesHash(normalizedCalories);

    // Check cache for same menu, budget, and tags
    let cached = false;
    let result;

    if (
      menuAnalysisCache.hasSameMenu(imageBuffer) &&
      menuAnalysisCache.hasSameBudget(budget) &&
      menuAnalysisCache.hasSameTags(tagsSig) &&
      menuAnalysisCache.hasSameCalories(calSig)
    ) {
      // Same image, budget, and tags - return cached result
      const cachedResult = menuAnalysisCache.getLastRecommendation();
      result = {
        menuInfo: cachedResult.menuInfo,
        recommendation: cachedResult.recommendation,
        tagsApplied: cachedResult.tagsApplied,
        caloriesApplied: cachedResult.caloriesApplied,
      };
      cached = true;
    } else if (menuAnalysisCache.hasSameMenu(imageBuffer)) {
      // Same image, different budget or tags - reuse menuInfo and recompute recommendation
      const cachedMenuInfo = menuAnalysisCache.getCachedMenuInfo();
      const menuAnalysisController = new MenuAnalysisController();
      result = await menuAnalysisController.handleRecommend({
        imageBuffer: null,
        imageMimeType: null,
        budget,
        userNote,
        tags: normalizedTags,
        calories: normalizedCalories,
        menuInfo: cachedMenuInfo,
      });

      // Update cache with new recommendation
      menuAnalysisCache.setLastRecommendation({
        imageBuffer,
        menuInfo: result.menuInfo,
        recommendation: result.recommendation,
        budget,
        tagsSig,
        calSig,
        tagsApplied: result.tagsApplied,
        caloriesApplied: result.caloriesApplied,
        hardConstraints: result.hardConstraints,
        softPreferences: result.softPreferences,
        guardViolations: result.guardViolations,
        removedByTags: result.removedByTags,
        filterDebug: result.filterDebug,
      });
    } else {
      // Different image or no cache - run full analysis
      const menuAnalysisController = new MenuAnalysisController();
      result = await menuAnalysisController.handleRecommend({
        imageBuffer,
        imageMimeType,
        budget,
        userNote,
        tags: normalizedTags,
        calories: normalizedCalories,
      });

      // Cache the result
      menuAnalysisCache.setLastRecommendation({
        imageBuffer,
        menuInfo: result.menuInfo,
        recommendation: result.recommendation,
        budget,
        tagsSig,
        calSig,
        tagsApplied: result.tagsApplied,
        caloriesApplied: result.caloriesApplied,
        hardConstraints: result.hardConstraints,
        softPreferences: result.softPreferences,
        guardViolations: result.guardViolations,
        removedByTags: result.removedByTags,
        filterDebug: result.filterDebug,
      });
    }

    // Return unified payload
    return {
      place: normalizedPlace,
      usedPhotoName: selectedPhoto.name,
      menuInfo: result.menuInfo,
      recommendation: result.recommendation,
      budget,
      cached,
      selection,
      tagsApplied: result.tagsApplied || normalizedTags,
      caloriesApplied: result.caloriesApplied,
    };
  } catch (error) {
    console.error("Error in getMenuRecommendationFromPlace:", error);
    throw error;
  }
}
