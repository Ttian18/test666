import express from "express";
import type { Request, Response } from "express";
import MenuAnalysisController from "../../services/restaurant/menuAnalysisController.ts";
import MenuAnalysisService from "../../services/restaurant/menuAnalysisService.ts";
import {
  handleError,
  createError,
} from "../../utils/errors/menuAnalysisErrors.js";
import menuAnalysisCache from "../../utils/cache/menuAnalysisCache.js";
import { uploadImageMemory } from "../../utils/upload/uploadUtils.js";
import { validateBudget } from "../../utils/validation/validationUtils.js";
import {
  getRestaurantPhotos,
  getMenuRecommendationFromPlace,
  getPlace,
  downloadPhotoBuffer,
} from "../../services/restaurant/placeMenuPhotoService.js";
import { extractTextFromImage } from "../../utils/ocr/ocrUtils.js";
import { scoreMenuLikeness } from "../../services/restaurant/menuPhotoFilter.js";
import { normalizeTags, tagsHash } from "../../utils/tagsUtils.js";
import { normalizeCalories, caloriesHash } from "../../utils/caloriesUtils.js";
import * as profileService from "../../services/auth/profileService.js";
import {
  mapProfileDiningStyleToTags,
  determineFinalTags,
} from "../../utils/tagsUtils.js";

const router = express.Router();

// Initialize controller and service
const menuAnalysisController = new MenuAnalysisController();
const menuAnalysisService = new MenuAnalysisService();

// Health check
router.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// POST /menu-analysis - Analyze menu image and provide budget recommendations (legacy endpoint)
router.post("/", uploadImageMemory.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return handleError(createError.missingImage(), res);
    }

    if (!req.file) {
      return handleError(createError.missingImage(), res);
    }

    const { budget, userNote = "" } = req.body;

    if (!budget || !Number.isFinite(Number(budget)) || Number(budget) <= 0) {
      return handleError(createError.invalidBudget(), res);
    }

    const imageBuffer = req.file.buffer;
    const imageMimeType = req.file.mimetype;

    // Check cache for same menu and budget
    if (
      menuAnalysisCache.hasSameMenu(imageBuffer) &&
      menuAnalysisCache.hasSameBudget(Number(budget))
    ) {
      const cached = menuAnalysisCache.getLastRecommendation();
      return res.status(200).json({
        message: "Cached recommendation",
        cached: true,
        menuInfo: cached.menuInfo,
        recommendation: cached.recommendation,
        timestamp: cached.ts,
      });
    }

    // Process the menu image
    const result = await menuAnalysisController.handleRecommend({
      imageBuffer,
      imageMimeType,
      budget: Number(budget),
      userNote,
      userId, // Pass userId for history tracking (required)
    });

    // Cache the result
    menuAnalysisCache.setLastRecommendation({
      imageBuffer,
      menuInfo: result.menuInfo,
      recommendation: result.recommendation,
      budget: Number(budget),
    });

    res.status(200).json({
      message: "Menu analysis completed successfully",
      cached: false,
      ...result,
    });
  } catch (error) {
    handleError(error, res);
  }
});

// POST /menu-analysis/recommend - Enhanced menu analysis with better validation and caching
router.post(
  "/recommend",
  uploadImageMemory.single("image"),
  async (req, res) => {
    try {
      const budgetRaw = req.body?.budget;
      const budget = budgetRaw !== undefined ? Number(budgetRaw) : undefined;
      const requestTags = req.body?.tags;
      const calories = req.body?.calories;
      const ignoreProfileTags = req.body?.ignoreProfileTags === "true";

      if (!req.file) {
        throw createError.missingImage();
      }

      // Validate mime type - only allow jpg, png, webp
      const validMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!validMimeTypes.includes(req.file.mimetype)) {
        throw createError.invalidMimeType();
      }

      // Validate image size - 6MB limit
      const maxSizeBytes = 6 * 1024 * 1024; // 6MB
      if (req.file.size > maxSizeBytes) {
        throw createError.imageTooLarge();
      }

      if (!Number.isFinite(budget) || budget <= 0) {
        throw createError.invalidBudget();
      }

      // Profile-based tag logic
      let profileTags = [];
      let tagSource = "defaults";

      try {
        // Check if user is authenticated via JWT
        const authHeader = req.header("x-auth-token");
        if (authHeader) {
          // Try to decode JWT to get user ID
          const jwt = (await import("jsonwebtoken")).default;
          const JWT_SECRET = process.env.JWT_SECRET || "your_secure_secret";

          try {
            const decoded = jwt.verify(authHeader, JWT_SECRET);
            if (decoded && decoded.id && typeof decoded.id === "number") {
              // Fetch user profile
              const profile = await profileService.getUserProfile(decoded.id);
              if (
                profile &&
                profile.lifestylePreferences &&
                profile.lifestylePreferences.diningStyle
              ) {
                profileTags = mapProfileDiningStyleToTags(
                  profile.lifestylePreferences.diningStyle
                );
                if (profileTags.length > 0) {
                  tagSource = "profile";
                }
              }
            }
          } catch (jwtError) {
            // JWT invalid or expired, continue without profile
            console.warn(
              "JWT validation failed, proceeding without profile:",
              jwtError.message
            );
          }
        }
      } catch (profileError) {
        // Profile fetch failed, continue without profile
        console.warn(
          "Profile fetch failed, proceeding without profile:",
          profileError.message
        );
      }

      // Determine final tags using the tag merge strategy
      const { finalTags, source } = determineFinalTags({
        requestTags: requestTags ? JSON.parse(requestTags) : [],
        ignoreProfileTags,
        profileTags,
      });

      // Normalize tags and compute signature
      const normalizedTags = normalizeTags(finalTags);
      const tagsSig = tagsHash(normalizedTags);

      // Normalize calories and compute signature
      const normalizedCalories = normalizeCalories(calories);
      const calSig = caloriesHash(normalizedCalories);

      const recommender = new MenuAnalysisController();
      let result;

      // Check cache logic with tags
      if (menuAnalysisCache.hasSameMenu(req.file.buffer)) {
        // Same menu, check if budget, tags, and calories are also the same
        if (
          menuAnalysisCache.hasSameBudget(budget) &&
          menuAnalysisCache.hasSameTags(tagsSig) &&
          menuAnalysisCache.hasSameCalories(calSig)
        ) {
          // All parameters match, return cached result
          const cached = menuAnalysisCache.getLastRecommendation();
          return res.json({
            menuInfo: cached.menuInfo,
            recommendation: cached.recommendation,
            tagsApplied: cached.tagsApplied || normalizedTags,
            hardConstraints: cached.hardConstraints || null,
            softPreferences: cached.softPreferences || null,
            caloriesApplied: cached.caloriesApplied || normalizedCalories,
            guardViolations: cached.guardViolations || [],
            removedByTags: cached.removedByTags || 0,
            filterDebug: cached.filterDebug || [],
            cached: true,
            usedTags: normalizedTags,
            tagSource: source,
          });
        } else {
          // Same menu, different budget or tags - reuse menuInfo, run full tag-aware recommendation
          const cachedMenuInfo = menuAnalysisCache.getCachedMenuInfo();

          // Always use the full tag-aware pipeline when tags are provided
          if (normalizedTags && normalizedTags.length > 0) {
            result = await recommender.handleRecommend({
              imageBuffer: null, // We don't need to re-analyze the image
              imageMimeType: null,
              budget,
              userNote: req.body?.note || "",
              tags: normalizedTags,
              calories: normalizedCalories,
              menuInfo: cachedMenuInfo,
            });
          } else {
            // No tags provided - use original budget service
            const recommendation =
              await recommender.budgetService.recommendDishes({
                menuInfo: cachedMenuInfo,
                budget,
                userNote: req.body?.note || "",
                calories: normalizedCalories,
              });

            result = {
              menuInfo: cachedMenuInfo,
              recommendation,
            };
          }
        }
      } else {
        // Different menu or no cache - run full extraction + recommendation
        result = await recommender.handleRecommend({
          imageBuffer: req.file.buffer,
          imageMimeType: req.file.mimetype,
          budget,
          userNote: req.body?.note || "",
          tags: normalizedTags,
          calories: normalizedCalories,
        });
      }

      // Store successful recommendation in cache
      menuAnalysisCache.setLastRecommendation({
        imageBuffer: req.file.buffer,
        menuInfo: result.menuInfo,
        recommendation: result.recommendation,
        budget,
        tagsSig,
        calSig,
        tagsApplied: result.tagsApplied,
        hardConstraints: result.hardConstraints,
        softPreferences: result.softPreferences,
        caloriesApplied: result.caloriesApplied,
        guardViolations: result.guardViolations,
        removedByTags: result.removedByTags,
        filterDebug: result.filterDebug,
      });

      // Return result with tag source information
      res.json({
        ...result,
        usedTags: normalizedTags,
        tagSource: source,
      });
    } catch (error) {
      handleError(error, res);
    }
  }
);

// GET /menu-analysis/last - Get the last cached recommendation
router.get("/last", (req, res) => {
  try {
    const cached = menuAnalysisCache.getLastRecommendation();

    if (!cached) {
      return handleError(createError.noCache(), res);
    }

    res.status(200).json({
      message: "Last cached recommendation",
      menuInfo: cached.menuInfo,
      recommendation: cached.recommendation,
      budget: cached.budget,
      tagsApplied: cached.tagsApplied || null,
      hardConstraints: cached.hardConstraints || null,
      softPreferences: cached.softPreferences || null,
      timestamp: cached.ts,
    });
  } catch (error) {
    handleError(error, res);
  }
});

// POST /menu-analysis/rebudget - Recalculate recommendation with different budget using cached menu info
router.post("/rebudget", async (req, res) => {
  try {
    const { budget, tags, calories, ignoreProfileTags } = req.body;

    if (!Number.isFinite(budget) || budget <= 0) {
      throw createError.invalidBudget();
    }

    if (menuAnalysisCache.isEmpty()) {
      throw createError.noCache();
    }

    const cachedMenuInfo = menuAnalysisCache.getCachedMenuInfo();
    if (!cachedMenuInfo) {
      throw createError.noCache();
    }

    // Profile-based tag logic
    let profileTags = [];
    let tagSource = "defaults";

    try {
      // Check if user is authenticated via JWT
      const authHeader = req.header("x-auth-token");
      if (authHeader) {
        // Try to decode JWT to get user ID
        const jwt = (await import("jsonwebtoken")).default;
        const JWT_SECRET = process.env.JWT_SECRET || "your_secure_secret";

        try {
          const decoded = jwt.verify(authHeader, JWT_SECRET);
          if (decoded && decoded.id && typeof decoded.id === "number") {
            // Fetch user profile
            const profile = await profileService.getUserProfile(decoded.id);
            if (
              profile &&
              profile.lifestylePreferences &&
              profile.lifestylePreferences.diningStyle
            ) {
              profileTags = mapProfileDiningStyleToTags(
                profile.lifestylePreferences.diningStyle
              );
              if (profileTags.length > 0) {
                tagSource = "profile";
              }
            }
          }
        } catch (jwtError) {
          // JWT invalid or expired, continue without profile
          console.warn(
            "JWT validation failed, proceeding without profile:",
            jwtError.message
          );
        }
      }
    } catch (profileError) {
      // Profile fetch failed, continue without profile
      console.warn(
        "Profile fetch failed, proceeding without profile:",
        profileError.message
      );
    }

    // Determine final tags using the tag merge strategy
    const { finalTags, source } = determineFinalTags({
      requestTags: tags || [],
      ignoreProfileTags: ignoreProfileTags === true,
      profileTags,
    });

    // Normalize tags and compute signature
    const normalizedTags = normalizeTags(finalTags);
    const tagsSig = tagsHash(normalizedTags);

    // Normalize calories and compute signature
    const normalizedCalories = normalizeCalories(calories);
    const calSig = caloriesHash(normalizedCalories);

    const recommender = new MenuAnalysisController();
    let result;

    // If tags are provided, use the new tag-aware flow
    if (normalizedTags.length > 0) {
      result = await recommender.handleRecommend({
        imageBuffer: null, // We don't have the image buffer in this endpoint
        imageMimeType: null,
        budget,
        userNote: req.body?.note || "",
        tags: normalizedTags,
        calories: normalizedCalories,
        menuInfo: cachedMenuInfo,
      });
    } else {
      // No tags - use original flow
      const recommendation = await recommender.budgetService.recommendDishes({
        menuInfo: cachedMenuInfo,
        budget,
        userNote: req.body?.note || "",
        calories: normalizedCalories,
      });

      result = {
        menuInfo: cachedMenuInfo,
        recommendation,
      };
    }

    // Update cache with new recommendation
    const currentCache = menuAnalysisCache.getLastRecommendation();
    menuAnalysisCache.setLastRecommendation({
      imageBuffer: null, // We don't have the image buffer in this endpoint
      menuInfo: result.menuInfo,
      recommendation: result.recommendation,
      budget,
      tagsSig,
      calSig,
      tagsApplied: result.tagsApplied,
      hardConstraints: result.hardConstraints,
      softPreferences: result.softPreferences,
      caloriesApplied: result.caloriesApplied,
      guardViolations: result.guardViolations,
      removedByTags: result.removedByTags,
      filterDebug: result.filterDebug,
    });

    // Return result with tag source information
    res.json({
      ...result,
      usedTags: normalizedTags,
      tagSource: source,
    });
  } catch (error) {
    handleError(error, res);
  }
});

// DELETE /menu-analysis/cache - Clear the cache
router.delete("/cache", (req, res) => {
  try {
    menuAnalysisCache.clear();
    res.status(200).json({
      message: "Cache cleared successfully",
    });
  } catch (error) {
    handleError(error, res);
  }
});

// GET /menu-analysis/from-place/:placeId/probe - Probe place for menu photos with signals
router.get("/from-place/:placeId/probe", async (req, res) => {
  try {
    const { placeId } = req.params;
    const { k = 15, ai = 0 } = req.query;
    const scanLimit = Math.min(parseInt(k) || 15, 20); // Cap at 20 photos
    const useAI = ai === "1";

    if (!placeId) {
      return res.status(400).json({
        error: "Missing placeId parameter",
        code: "MISSING_PLACE_ID",
      });
    }

    // Fetch place details and photos
    const place = await getPlace(placeId);

    if (!place.photos || place.photos.length === 0) {
      return res.status(200).json({
        place: {
          id: place.id,
          name: place.displayName?.text ?? String(place.displayName ?? ""),
          address: place.formattedAddress || "",
        },
        totalPhotos: 0,
        scanned: 0,
        signals: {
          hasLikelyMenu: false,
          heuristicTopScore: 0,
          aiPositives: 0,
          ocrPriceHitsTop: 0,
        },
        perPhoto: [],
      });
    }

    // Normalize place data
    const normalizedPlace = {
      id: place.id,
      name: place.displayName?.text ?? String(place.displayName ?? ""),
      address: place.formattedAddress || "",
    };

    // Scan top K photos
    const photosToScan = place.photos.slice(0, scanLimit);
    const perPhoto = [];
    let heuristicTopScore = 0;
    let aiPositives = 0;
    let ocrPriceHitsTop = 0;

    for (const photo of photosToScan) {
      try {
        // Get thumbnail for analysis
        const { buffer: thumbBuffer } = await downloadPhotoBuffer(
          photo.name,
          512
        );

        // Compute heuristic score
        const scoreResult = scoreMenuLikeness(photo);
        const heuristicScore = scoreResult.totalScore;
        heuristicTopScore = Math.max(heuristicTopScore, heuristicScore);

        // Run OCR on thumbnail
        const ocrResult = await extractTextFromImage(thumbBuffer, 2000);
        const ocrPriceHits = ocrResult.priceHits;
        const ocrMenuKeywords = ocrResult.menuKeywords;
        ocrPriceHitsTop = Math.max(ocrPriceHitsTop, ocrPriceHits);

        // Run AI judge if requested
        let aiResult = null;
        if (useAI) {
          try {
            // Import OpenAI and create aiJudge function
            const OpenAI = (await import("openai")).default;
            const openai = process.env.OPENAI_API_KEY
              ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
              : null;

            if (openai) {
              const b64 = thumbBuffer.toString("base64");
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
                        image_url: { url: `data:image/jpeg;base64,${b64}` },
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
                  const jsonMatch = txt.match(/\{[\s\S]*\}/);
                  if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[0]);
                  } else {
                    parsed = {
                      isMenu: false,
                      confidence: 0,
                      reason: "parse_failed",
                    };
                  }
                } catch {
                  parsed = {
                    isMenu: false,
                    confidence: 0,
                    reason: "parse_failed",
                  };
                }
              }

              aiResult = {
                isMenu: Boolean(parsed.isMenu),
                confidence: Number(parsed.confidence) || 0,
                reason: String(parsed.reason || "no_reason_provided"),
              };

              if (aiResult.isMenu) {
                aiPositives++;
              }
            } else {
              aiResult = {
                isMenu: false,
                confidence: 0,
                reason: "ai_disabled",
              };
            }
          } catch (aiError) {
            console.warn(
              `AI judge failed for photo ${photo.name}:`,
              aiError.message
            );
            aiResult = {
              isMenu: false,
              confidence: 0,
              reason: `ai_error: ${aiError.message}`,
            };
          }
        }

        perPhoto.push({
          name: photo.name,
          w: photo.widthPx,
          h: photo.heightPx,
          heuristicScore,
          ocrPriceHits,
          ocrMenuKeywords,
          ai: aiResult,
        });
      } catch (error) {
        console.warn(`Failed to analyze photo ${photo.name}:`, error.message);
        perPhoto.push({
          name: photo.name,
          w: photo.widthPx,
          h: photo.heightPx,
          heuristicScore: 0,
          ocrPriceHits: 0,
          ocrMenuKeywords: [],
          ai: null,
          error: error.message,
        });
      }
    }

    // Determine if place has likely menu photos
    const hasLikelyMenu =
      heuristicTopScore >= 70 || aiPositives > 0 || ocrPriceHitsTop >= 5;

    res.status(200).json({
      place: normalizedPlace,
      totalPhotos: place.photos.length,
      scanned: photosToScan.length,
      signals: {
        hasLikelyMenu,
        heuristicTopScore,
        aiPositives,
        ocrPriceHitsTop,
      },
      perPhoto,
    });
  } catch (error) {
    console.error("Error probing restaurant photos:", error);
    res.status(500).json({
      error: "Failed to probe restaurant photos",
      details: error.message,
    });
  }
});

// GET /menu-analysis/from-place/:placeId/photos - Get restaurant photos for preview/selection
router.get("/from-place/:placeId/photos", async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({
        error: "Missing placeId parameter",
        code: "MISSING_PLACE_ID",
      });
    }

    const result = await getRestaurantPhotos(placeId);

    // Return up to 10 candidate photos with metadata
    const candidatePhotos = result.photos.slice(0, 10).map((photo) => ({
      name: photo.name,
      width: photo.widthPx,
      height: photo.heightPx,
      authorAttributions: photo.authorAttributions || [],
      menuScore: photo.menuScore || 0,
    }));

    // If we have selection data, use it to enhance the response
    if (result.selection && result.selection.candidates) {
      // Replace with scored candidates from selection
      const scoredCandidates = result.selection.candidates.map((candidate) => ({
        name: candidate.name,
        width: candidate.widthPx,
        height: candidate.heightPx,
        authorAttributions: candidate.authorAttributions || [],
        menuScore: candidate.menuScore || 0,
      }));

      // Use scored candidates if available, otherwise use basic photos
      const finalPhotos =
        scoredCandidates.length > 0 ? scoredCandidates : candidatePhotos;

      res.status(200).json({
        place: result.place,
        photos: finalPhotos,
        selection: result.selection,
      });
    } else {
      res.status(200).json({
        place: result.place,
        photos: candidatePhotos,
        selection: result.selection,
      });
    }
  } catch (error) {
    console.error("Error fetching restaurant photos:", error);
    res.status(500).json({
      error: "Failed to fetch restaurant photos",
      details: error.message,
    });
  }
});

// POST /menu-analysis/from-place/:placeId/menu-recommendation - Get menu recommendation from place
router.post("/from-place/:placeId/menu-recommendation", async (req, res) => {
  try {
    const { placeId } = req.params;
    const {
      budget,
      note = "",
      photoName,
      tags,
      calories,
      ignoreProfileTags,
    } = req.body;

    if (!placeId) {
      return res.status(400).json({
        error: "Missing placeId parameter",
        code: "MISSING_PLACE_ID",
      });
    }

    // Validate budget via numeric conversion
    const numericBudget = Number(budget);
    if (!Number.isFinite(numericBudget) || numericBudget <= 0) {
      return res.status(400).json({
        error: "Invalid budget. Must be a positive number.",
        code: "INVALID_BUDGET",
      });
    }

    // Profile-based tag logic
    let profileTags = [];
    let tagSource = "defaults";

    try {
      // Check if user is authenticated via JWT
      const authHeader = req.header("x-auth-token");
      if (authHeader) {
        // Try to decode JWT to get user ID
        const jwt = (await import("jsonwebtoken")).default;
        const JWT_SECRET = process.env.JWT_SECRET || "your_secure_secret";

        try {
          const decoded = jwt.verify(authHeader, JWT_SECRET);
          if (decoded && decoded.id && typeof decoded.id === "number") {
            // Fetch user profile
            const profile = await profileService.getUserProfile(decoded.id);
            if (
              profile &&
              profile.lifestylePreferences &&
              profile.lifestylePreferences.diningStyle
            ) {
              profileTags = mapProfileDiningStyleToTags(
                profile.lifestylePreferences.diningStyle
              );
              if (profileTags.length > 0) {
                tagSource = "profile";
              }
            }
          }
        } catch (jwtError) {
          // JWT invalid or expired, continue without profile
          console.warn(
            "JWT validation failed, proceeding without profile:",
            jwtError.message
          );
        }
      }
    } catch (profileError) {
      // Profile fetch failed, continue without profile
      console.warn(
        "Profile fetch failed, proceeding without profile:",
        profileError.message
      );
    }

    // Determine final tags using the tag merge strategy
    const { finalTags, source } = determineFinalTags({
      requestTags: tags || [],
      ignoreProfileTags: ignoreProfileTags === true,
      profileTags,
    });

    // Call the unified service method with final tags
    const result = await getMenuRecommendationFromPlace(
      placeId,
      numericBudget,
      note,
      photoName,
      finalTags,
      calories
    );

    // Handle undecided case
    if (result.undecided) {
      return res.status(409).json({
        error: "Unable to automatically select menu photo",
        code: "NEED_USER_SELECTION",
        needUserPick: true,
        candidates: result.candidates.map((candidate) => ({
          name: candidate.name,
          width: candidate.widthPx,
          height: candidate.heightPx,
          authorAttributions: candidate.authorAttributions || [],
          menuScore: candidate.menuScore,
          ocrPriceHits: candidate.ocrPriceHits || 0,
          ocrMenuKeywords: candidate.ocrMenuKeywords || [],
          componentScores: candidate.componentScores || {},
        })),
        selection: result.selection,
        usedTags: finalTags,
        tagSource: source,
      });
    }

    // Return successful result with tag source information
    res.status(200).json({
      ...result,
      usedTags: finalTags,
      tagSource: source,
    });
  } catch (error) {
    console.error("Error processing menu recommendation from place:", error);

    // Handle specific error cases
    if (error.message === "No photos found for this restaurant") {
      return res.status(404).json({
        error: "No photos found for this restaurant",
        code: "NO_PHOTOS",
      });
    }

    if (error.message === "Specified photo not found") {
      return res.status(400).json({
        error: "Specified photo not found",
        code: "PHOTO_NOT_FOUND",
      });
    }

    if (error.message === "No suitable menu photo found") {
      return res.status(404).json({
        error: "No suitable menu photo found",
        code: "NO_MENU_PHOTO",
      });
    }

    res.status(500).json({
      error: "Failed to process menu recommendation",
      details: error.message,
    });
  }
});

export default router;
