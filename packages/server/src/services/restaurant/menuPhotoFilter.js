/**
 * Menu Photo Heuristics Service
 *
 * This service provides logic for scoring and selecting the most likely menu photo
 * from a collection of restaurant photos using various heuristics.
 */

/**
 * Score a photo based on its likelihood of being a menu
 * @param {Object} photo - Photo object with metadata
 * @param {string} photo.name - Photo name/ID
 * @param {number} photo.widthPx - Photo width in pixels
 * @param {number} photo.heightPx - Photo height in pixels
 * @param {Array} photo.authorAttributions - Author attribution information
 * @param {Object} ocrData - Optional OCR data { priceHits, menuKeywords }
 * @returns {Object} Score breakdown with total score and component scores
 */
export function scoreMenuLikeness(photo, ocrData = null) {
  let baseScore = 0;
  let aspectScore = 0;
  let attributionScore = 0;
  let ocrPriceBoost = 0;
  let ocrKeywordBoost = 0;

  // Size-based scoring (menus are typically large, readable documents)
  const area = photo.widthPx * photo.heightPx;
  const aspectRatio = photo.widthPx / photo.heightPx;

  // Base score from size
  if (area > 1000000) baseScore += 30; // > 1MP
  else if (area > 500000) baseScore += 20; // > 500K
  else if (area > 200000) baseScore += 10; // > 200K

  // Aspect ratio scoring
  if (aspectRatio < 1.2) aspectScore += 20; // Portrait
  else if (aspectRatio > 2.0) aspectScore -= 10; // Very wide

  // Attribution hints (some photos might have menu-related descriptions)
  if (photo.authorAttributions && photo.authorAttributions.length > 0) {
    const attributionText = JSON.stringify(
      photo.authorAttributions
    ).toLowerCase();
    const menuKeywords = [
      "menu",
      "food",
      "dish",
      "meal",
      "restaurant",
      "dining",
    ];

    for (const keyword of menuKeywords) {
      if (attributionText.includes(keyword)) {
        attributionScore += 15;
        break;
      }
    }
  }

  // Bonus for reasonable dimensions (not too small, not too large)
  if (photo.widthPx >= 800 && photo.heightPx >= 600) baseScore += 10;

  // OCR-based boosts
  if (ocrData) {
    // Price boost: +10 if >= 3 price hits
    if (ocrData.priceHits >= 3) {
      ocrPriceBoost = 10;
    }

    // Keyword boost: +5 if any menu keywords found
    if (ocrData.menuKeywords && ocrData.menuKeywords.length > 0) {
      ocrKeywordBoost = 5;
    }
  }

  const totalScore =
    baseScore +
    aspectScore +
    attributionScore +
    ocrPriceBoost +
    ocrKeywordBoost;

  return {
    totalScore: Math.min(100, Math.max(0, totalScore)),
    componentScores: {
      base: baseScore,
      aspect: aspectScore,
      attribution: attributionScore,
      ocrPriceBoost,
      ocrKeywordBoost,
    },
  };
}

/**
 * Pick the most likely menu photo from a collection
 * @param {Array} photos - Array of photo objects
 * @returns {Object|null} The photo with highest menu likelihood score, or null if no photos
 */
export function pickLikelyMenuPhoto(photos) {
  if (!photos || photos.length === 0) {
    return null;
  }

  // Score all photos
  const scoredPhotos = photos.map((photo) => {
    const scoreResult = scoreMenuLikeness(photo);
    return {
      ...photo,
      menuScore: scoreResult.totalScore,
      componentScores: scoreResult.componentScores,
    };
  });

  // Sort by score (highest first)
  scoredPhotos.sort((a, b) => b.menuScore - a.menuScore);

  return scoredPhotos[0];
}

/**
 * Get top N photos sorted by menu likelihood
 * @param {Array} photos - Array of photo objects
 * @param {number} limit - Maximum number of photos to return
 * @returns {Array} Top photos sorted by menu likelihood score
 */
export function getTopMenuPhotos(photos, limit = 5) {
  if (!photos || photos.length === 0) {
    return [];
  }

  // Score all photos
  const scoredPhotos = photos.map((photo) => {
    const scoreResult = scoreMenuLikeness(photo);
    return {
      ...photo,
      menuScore: scoreResult.totalScore,
      componentScores: scoreResult.componentScores,
    };
  });

  // Sort by score (highest first) and return top N
  return scoredPhotos.sort((a, b) => b.menuScore - a.menuScore).slice(0, limit);
}

// Default thresholds and limits
export const DEFAULT_HEURISTIC_THRESHOLD = 70;
export const DEFAULT_AI_THRESHOLD = 0.6;
export const DEFAULT_TOPK_FOR_AI = 5;
export const DEFAULT_CANDIDATE_LIMIT = 6;

/**
 * Smooth function to convert scores to 0-1 range
 * @param {number} x - Input value
 * @param {number} steepness - How steep the transition is
 * @returns {number} Value between 0 and 1
 */
function smooth01(x, steepness = 0.1) {
  return 1 / (1 + Math.exp(-steepness * (x - 50)));
}

/**
 * Score OCR text for menu likelihood (optional feature)
 * @param {string} ocrText - OCR extracted text
 * @returns {number} Score between 0-100
 */
export function scoreOcrText(ocrText) {
  if (!ocrText) return 0;

  const text = ocrText.toLowerCase();
  let score = 0;

  // Menu-specific keywords
  const menuKeywords = [
    "menu",
    "appetizer",
    "entree",
    "dessert",
    "beverage",
    "drink",
    "price",
    "$",
    "€",
    "£",
  ];
  const pricePatterns = [/\$\d+/, /€\d+/, /£\d+/, /\d+\.\d{2}/];

  // Check for menu keywords
  for (const keyword of menuKeywords) {
    if (text.includes(keyword)) score += 10;
  }

  // Check for price patterns
  for (const pattern of pricePatterns) {
    if (pattern.test(text)) score += 15;
  }

  // Check for numbered items (like menu items)
  const numberedItems = text.match(/\d+\./g);
  if (numberedItems && numberedItems.length > 2) score += 20;

  return Math.min(100, score);
}

/**
 * Two-stage menu photo selection with heuristic + AI judge
 * @param {Array} photos - Array of photo objects
 * @param {Object} options - Selection options
 * @param {Function} options.fetchThumb - Async function to fetch thumbnail (photo) => { buffer, mime }
 * @param {Function} options.aiJudge - Async function to judge photo (buffer, mime) => { isMenu, confidence, reason }
 * @param {number} options.heuristicThreshold - Minimum heuristic score to accept (default: 70)
 * @param {number} options.aiThreshold - Minimum AI confidence to accept (default: 0.6)
 * @param {number} options.topK - Number of top photos to send to AI (default: 5)
 * @param {number} options.candidateLimit - Maximum candidates to return if undecided (default: 6)
 * @param {Object} options.ocrData - Optional OCR data for photos { photoName: { priceHits, menuKeywords } }
 * @returns {Promise<Object>} Selection result with decision and metadata
 */
export async function selectMenuPhoto(
  photos,
  {
    fetchThumb,
    aiJudge,
    heuristicThreshold = DEFAULT_HEURISTIC_THRESHOLD,
    aiThreshold = DEFAULT_AI_THRESHOLD,
    topK = DEFAULT_TOPK_FOR_AI,
    candidateLimit = DEFAULT_CANDIDATE_LIMIT,
    ocrData = {},
  } = {}
) {
  if (!photos || photos.length === 0) {
    return {
      decision: "no_photos",
      pickedPhoto: null,
      candidates: [],
      metadata: { reason: "No photos available" },
    };
  }

  // Stage 1: Heuristic scoring with OCR integration
  const scoredPhotos = photos.map((photo) => {
    const ocrInfo = ocrData[photo.name] || { priceHits: 0, menuKeywords: [] };
    const scoreResult = scoreMenuLikeness(photo, ocrInfo);
    return {
      ...photo,
      menuScore: scoreResult.totalScore,
      componentScores: scoreResult.componentScores,
      ocrPriceHits: ocrInfo.priceHits,
      ocrMenuKeywords: ocrInfo.menuKeywords,
    };
  });

  // Sort by heuristic score
  scoredPhotos.sort((a, b) => b.menuScore - a.menuScore);

  const topPhoto = scoredPhotos[0];

  // Stage 1 decision: Accept if heuristic score is high enough
  if (topPhoto.menuScore >= heuristicThreshold) {
    return {
      decision: "heuristic",
      pickedPhoto: topPhoto,
      pickedConfidence: smooth01(topPhoto.menuScore),
      candidates: [],
      metadata: {
        reason: `Heuristic score ${topPhoto.menuScore} >= threshold ${heuristicThreshold}`,
        heuristicScore: topPhoto.menuScore,
        componentScores: topPhoto.componentScores,
      },
    };
  }

  // Stage 2: AI judge on top-K photos
  if (!aiJudge || !fetchThumb) {
    // No AI available, return candidates for UI selection
    return {
      decision: "undecided",
      pickedPhoto: null,
      candidates: scoredPhotos.slice(0, candidateLimit).map((photo) => ({
        name: photo.name,
        widthPx: photo.widthPx,
        heightPx: photo.heightPx,
        authorAttributions: photo.authorAttributions || [],
        menuScore: photo.menuScore,
        ocrPriceHits: photo.ocrPriceHits,
        ocrMenuKeywords: photo.ocrMenuKeywords,
        componentScores: photo.componentScores,
      })),
      metadata: {
        reason: "AI judge not available",
        heuristicScore: topPhoto.menuScore,
        componentScores: topPhoto.componentScores,
      },
    };
  }

  // Get top-K photos for AI evaluation
  const topKPhotos = scoredPhotos.slice(0, topK);
  const aiJudgements = [];

  try {
    // Evaluate each photo with AI
    for (const photo of topKPhotos) {
      try {
        const { buffer, mime } = await fetchThumb(photo);
        const judgement = await aiJudge(buffer, mime);

        aiJudgements.push({
          photoName: photo.name,
          isMenu: judgement.isMenu,
          confidence: judgement.confidence,
          reason: judgement.reason,
        });

        // Accept if AI is confident this is a menu
        if (judgement.isMenu && judgement.confidence >= aiThreshold) {
          return {
            decision: "ai",
            pickedPhoto: photo,
            pickedConfidence: judgement.confidence,
            candidates: [],
            aiJudgements,
            metadata: {
              reason: `AI confident menu (${judgement.confidence} >= ${aiThreshold})`,
              heuristicScore: photo.menuScore,
              componentScores: photo.componentScores,
            },
          };
        }
      } catch (error) {
        console.warn(
          `AI evaluation failed for photo ${photo.name}:`,
          error.message
        );
        aiJudgements.push({
          photoName: photo.name,
          isMenu: false,
          confidence: 0,
          reason: `ai_error: ${error.message}`,
        });
      }
    }
  } catch (error) {
    console.error("AI evaluation failed:", error);
  }

  // No confident AI decision, return candidates for UI selection
  return {
    decision: "undecided",
    pickedPhoto: null,
    candidates: scoredPhotos.slice(0, candidateLimit).map((photo) => ({
      name: photo.name,
      widthPx: photo.widthPx,
      heightPx: photo.heightPx,
      authorAttributions: photo.authorAttributions || [],
      menuScore: photo.menuScore,
      ocrPriceHits: photo.ocrPriceHits,
      ocrMenuKeywords: photo.ocrMenuKeywords,
      componentScores: photo.componentScores,
    })),
    aiJudgements,
    metadata: {
      reason: "No confident AI decision",
      heuristicScore: topPhoto.menuScore,
      componentScores: topPhoto.componentScores,
    },
  };
}
