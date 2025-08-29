import crypto from "crypto";
import { DEFAULT_TAGS } from "../config/preferenceTags.js";
import { INGREDIENT_SYNONYMS } from "../services/restaurant/tagRules.js";

/**
 * Normalize tags input to a standardized array
 * @param {string|string[]} input - Tags as string or array
 * @returns {string[]} Normalized tags array
 */
export function normalizeTags(input) {
  if (!input) {
    return [...DEFAULT_TAGS];
  }

  let tags;
  if (typeof input === "string") {
    // Split by comma first, then by space, but preserve negative patterns
    const commaSplit = input.split(",").map((part) => part.trim());
    tags = [];

    for (const part of commaSplit) {
      if (
        part.startsWith("no ") ||
        part.startsWith("avoid ") ||
        part.startsWith("exclude ")
      ) {
        // Keep negative patterns as single tags
        tags.push(part);
      } else if (part.endsWith(" free") || part.endsWith("-free")) {
        // Keep X-free patterns as single tags
        tags.push(part);
      } else {
        // Split by space for other patterns
        const spaceSplit = part.split(/\s+/).filter((tag) => tag.trim());
        tags.push(...spaceSplit);
      }
    }
  } else if (Array.isArray(input)) {
    tags = input;
  } else {
    return [...DEFAULT_TAGS];
  }

  // Normalize each tag - keep separators for negative patterns
  const normalized = tags
    .map((tag) => tag.toLowerCase().trim())
    .filter((tag) => tag.length > 0)
    .map((tag) => tag.replace(/[^a-z0-9:\- ]/g, "")) // Keep alphanumeric, colon, hyphen, space
    .filter((tag) => tag.length > 0); // Remove empty after cleaning

  // Remove duplicates
  const unique = [...new Set(normalized)];

  // If no valid tags, return defaults
  return unique.length > 0 ? unique : [...DEFAULT_TAGS];
}

/**
 * Parse dynamic negative keys from tags
 * @param {string[]} tags - Array of normalized tags
 * @returns {string[]} Array of canonical ingredient keys
 */
export function parseDynamicNegativeKeys(tags = []) {
  const negativeKeys = [];

  for (const tag of tags) {
    // Pattern: noX / no-X / no:X / "avoid X"/"avoid-X"/"avoid:X" / "exclude X" / "X-free"/"X free"
    let key = null;

    // noX pattern
    if (tag.startsWith("no") && tag.length > 2) {
      key = tag.substring(2);
    }
    // no-X pattern
    else if (tag.startsWith("no-")) {
      key = tag.substring(3);
    }
    // no:X pattern
    else if (tag.startsWith("no:")) {
      key = tag.substring(3);
    }
    // avoid X pattern
    else if (tag.startsWith("avoid ")) {
      key = tag.substring(6);
    }
    // avoid-X pattern
    else if (tag.startsWith("avoid-")) {
      key = tag.substring(6);
    }
    // avoid:X pattern
    else if (tag.startsWith("avoid:")) {
      key = tag.substring(6);
    }
    // exclude X pattern
    else if (tag.startsWith("exclude ")) {
      key = tag.substring(8);
    }
    // exclude-X pattern
    else if (tag.startsWith("exclude-")) {
      key = tag.substring(8);
    }
    // exclude:X pattern
    else if (tag.startsWith("exclude:")) {
      key = tag.substring(8);
    }
    // X-free pattern
    else if (tag.endsWith("-free")) {
      key = tag.substring(0, tag.length - 5);
    }
    // X free pattern
    else if (tag.endsWith(" free")) {
      key = tag.substring(0, tag.length - 5);
    }

    if (key) {
      // Clean the key - accept ANY negative preference, not just predefined ones
      const cleanKey = key.replace(/[^a-z0-9]/g, "");
      if (cleanKey && cleanKey.length > 0) {
        negativeKeys.push(cleanKey);
      }
    }
  }

  return [...new Set(negativeKeys)]; // Remove duplicates
}

/**
 * Build dynamic hard terms from negative keys
 * @param {string[]} negativeKeys - Array of canonical ingredient keys
 * @returns {string[]} Array of expanded terms to exclude
 */
export function buildDynamicHardTerms(negativeKeys = []) {
  const terms = [];

  for (const key of negativeKeys) {
    if (INGREDIENT_SYNONYMS[key]) {
      terms.push(...INGREDIENT_SYNONYMS[key]);
    } else {
      // Fallback to the key itself
      terms.push(key);
    }
  }

  // Dedupe and lowercase
  return [...new Set(terms.map((term) => term.toLowerCase()))];
}

/**
 * Split tags into hard core, dynamic negatives, and soft preferences
 * @param {string[]} tags - Array of normalized tags
 * @returns {Object} Object with hardCore, negKeys, and soft arrays
 */
export function splitHardSoftTags(tags = []) {
  const CORE = new Set(["vegan", "vegetarian", "glutenfree"]);
  const negKeys = parseDynamicNegativeKeys(tags);
  const hardCore = tags.filter((t) => CORE.has(t));

  // Soft = tags that are NOT core hard AND NOT dynamic negatives
  const soft = tags.filter((t) => {
    // Exclude core hard tags
    if (CORE.has(t)) return false;

    // Exclude dynamic negative patterns
    const isNegative =
      t.startsWith("no") ||
      t.startsWith("avoid") ||
      t.startsWith("exclude") ||
      t.endsWith("free");

    return !isNegative;
  });

  return { hardCore, negKeys, soft };
}

/**
 * Create a hash signature for tags array
 * @param {string[]} tags - Array of normalized tags
 * @returns {string} SHA1 hash of sorted tags
 */
export function tagsHash(tags) {
  if (!Array.isArray(tags) || tags.length === 0) {
    return crypto.createHash("sha1").update("").digest("hex");
  }

  const sortedTags = [...tags].sort();
  const tagsString = sortedTags.join(",");
  return crypto.createHash("sha1").update(tagsString).digest("hex");
}
