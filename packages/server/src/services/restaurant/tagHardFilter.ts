import {
  splitHardSoftTags,
  buildDynamicHardTerms,
} from "../../utils/tagsUtils";
import { INGREDIENT_SYNONYMS } from "./tagRules";

/**
 * Apply hard filters for dietary restrictions
 * @param {Object} menuInfo - Menu information with items array
 * @param {string[]} tags - Array of dietary preference tags
 * @returns {Object} Filtered items and debug info
 */
export function applyHardFilter(menuInfo, tags) {
  if (
    !menuInfo?.items ||
    !Array.isArray(menuInfo.items) ||
    !Array.isArray(tags)
  ) {
    return {
      allowedItems: menuInfo?.items || [],
      removedCount: 0,
      debug: [],
      hardCore: [],
      negKeys: [],
      soft: [],
    };
  }

  // Split tags into hard core, dynamic negatives, and soft preferences
  const { hardCore, negKeys, soft } = splitHardSoftTags(tags);

  // Build dynamic hard terms for exclusion
  const negTerms = buildDynamicHardTerms(negKeys);

  const allowedItems = [];
  const debug = [];
  let removedCount = 0;

  for (const item of menuInfo.items) {
    const text = `${item.name || ""} ${item.description || ""}`.toLowerCase();
    let shouldExclude = false;
    let excludeReason = "";
    let excludeTag = "";

    // Dynamic negative filter first
    if (negTerms.length > 0) {
      const matchedTerm = negTerms.find((term) => {
        // Use word boundary matching to avoid false positives
        // This ensures "tea" doesn't match "steak"
        // Escape special regex characters and handle multi-word terms
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const wordBoundaryRegex = new RegExp(`\\b${escapedTerm}\\b`, "i");
        return wordBoundaryRegex.test(text);
      });
      if (matchedTerm) {
        // Find which negative key this term belongs to
        const matchedKey = negKeys.find((key) => {
          const synonyms = INGREDIENT_SYNONYMS[key] || [key];
          return synonyms.some((syn) => syn.toLowerCase() === matchedTerm);
        });

        shouldExclude = true;
        excludeReason = "dynamic_exclude";
        excludeTag = `no:${matchedKey || matchedTerm}`;
      }
    }

    // Core hard filters (only if not already excluded by dynamic negatives)
    if (!shouldExclude) {
      // Vegan filter
      if (hardCore.includes("vegan")) {
        const nonVeganTerms = [
          "chicken",
          "beef",
          "pork",
          "lamb",
          "duck",
          "turkey",
          "bacon",
          "ham",
          "sausage",
          "fish",
          "tuna",
          "salmon",
          "shrimp",
          "crab",
          "lobster",
          "oyster",
          "clam",
          "mussel",
          "scallop",
          "egg",
          "milk",
          "cheese",
          "butter",
          "cream",
          "yogurt",
          "honey",
        ];

        const hasNonVegan = nonVeganTerms.some((term) => {
          const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const wordBoundaryRegex = new RegExp(`\\b${escapedTerm}\\b`, "i");
          return wordBoundaryRegex.test(text);
        });
        const hasVeganIndicator =
          text.includes("vegan") || text.includes("plant-based");

        if (hasNonVegan && !hasVeganIndicator) {
          shouldExclude = true;
          excludeReason = "Contains non-vegan ingredients";
          excludeTag = "vegan";
        }
      }

      // Vegetarian filter (if not already excluded by vegan)
      if (!shouldExclude && hardCore.includes("vegetarian")) {
        const meatTerms = [
          "chicken",
          "beef",
          "pork",
          "lamb",
          "duck",
          "turkey",
          "bacon",
          "ham",
          "sausage",
          "fish",
          "tuna",
          "salmon",
          "shrimp",
          "crab",
          "lobster",
          "oyster",
          "clam",
          "mussel",
          "scallop",
        ];

        const hasMeat = meatTerms.some((term) => {
          const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const wordBoundaryRegex = new RegExp(`\\b${escapedTerm}\\b`, "i");
          return wordBoundaryRegex.test(text);
        });
        const hasVegetarianIndicator =
          text.includes("vegetarian") || text.includes("vegan");

        if (hasMeat && !hasVegetarianIndicator) {
          shouldExclude = true;
          excludeReason = "Contains meat or seafood";
          excludeTag = "vegetarian";
        }
      }

      // Gluten-free filter
      if (!shouldExclude && hardCore.includes("glutenfree")) {
        const glutenTerms = [
          "bread",
          "bun",
          "pasta",
          "noodle",
          "dumpling",
          "flour",
          "tortilla",
          "batter",
          "wheat",
          "breadcrumbs",
          "soy sauce",
        ];

        const hasGluten = glutenTerms.some((term) => {
          const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const wordBoundaryRegex = new RegExp(`\\b${escapedTerm}\\b`, "i");
          return wordBoundaryRegex.test(text);
        });
        const hasGlutenFreeIndicator =
          text.includes("gf") ||
          text.includes("gluten-free") ||
          text.includes("gluten free");

        if (hasGluten && !hasGlutenFreeIndicator) {
          shouldExclude = true;
          excludeReason = "Contains gluten";
          excludeTag = "glutenfree";
        }
      }
    }

    if (shouldExclude) {
      removedCount++;
      debug.push({
        id: item.id || item.name,
        name: item.name,
        reason: excludeReason,
        tag: excludeTag,
        matched:
          excludeReason === "dynamic_exclude"
            ? negTerms.find((term) => {
                const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                const wordBoundaryRegex = new RegExp(
                  `\\b${escapedTerm}\\b`,
                  "i"
                );
                return wordBoundaryRegex.test(text);
              })
            : undefined,
        text: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
      });
    } else {
      allowedItems.push(item);
    }
  }

  return {
    allowedItems,
    removedCount,
    debug,
    hardCore,
    negKeys,
    soft,
  };
}
