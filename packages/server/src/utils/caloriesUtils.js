import crypto from "crypto";

/**
 * Normalize calories input to standardized format
 * @param {number|string|object} input - Calories as number, JSON string, or object
 * @returns {Object} Normalized calories object with maxPerPerson
 */
export function normalizeCalories(input) {
  // Default if no input
  if (!input) {
    return { maxPerPerson: 800 };
  }

  // If it's already a number, treat as maxPerPerson
  if (typeof input === "number" && Number.isFinite(input) && input > 0) {
    return { maxPerPerson: Math.round(input) };
  }

  // If it's a string, try to parse as JSON or number
  if (typeof input === "string") {
    const trimmed = input.trim();

    // Try parsing as JSON first
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object") {
        const maxPerPerson =
          parsed.maxPerPerson || parsed.calories || parsed.max;
        if (Number.isFinite(maxPerPerson) && maxPerPerson > 0) {
          return { maxPerPerson: Math.round(maxPerPerson) };
        }
      }
    } catch (e) {
      // Not valid JSON, try as number
      const num = Number(trimmed);
      if (Number.isFinite(num) && num > 0) {
        return { maxPerPerson: Math.round(num) };
      }
    }
  }

  // If it's an object, extract maxPerPerson
  if (typeof input === "object" && input !== null) {
    const maxPerPerson = input.maxPerPerson || input.calories || input.max;
    if (Number.isFinite(maxPerPerson) && maxPerPerson > 0) {
      return { maxPerPerson: Math.round(maxPerPerson) };
    }
  }

  // Fallback to default
  return { maxPerPerson: 800 };
}

/**
 * Create a hash signature for calories object
 * @param {Object} calories - Calories object with maxPerPerson
 * @returns {string} SHA1 hash of calories signature
 */
export function caloriesHash(calories) {
  if (!calories || !calories.maxPerPerson) {
    return crypto.createHash("sha1").update("").digest("hex");
  }

  const caloriesString = `maxPerPerson:${calories.maxPerPerson}`;
  return crypto.createHash("sha1").update(caloriesString).digest("hex");
}
