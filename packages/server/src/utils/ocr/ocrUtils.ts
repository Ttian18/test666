// OCR utility functions with timeout and graceful fallback
let tesseract = null;

// Lazy import tesseract.js
async function getTesseract() {
  if (!tesseract) {
    try {
      const { createWorker } = await import("tesseract.js");
      tesseract = createWorker;
    } catch (error) {
      console.warn(
        "tesseract.js not available, OCR features disabled:",
        error.message
      );
      return null;
    }
  }
  return tesseract;
}

// Menu keywords for OCR detection
const MENU_KEYWORDS = [
  "appetizers",
  "starters",
  "entrees",
  "mains",
  "desserts",
  "beverages",
  "drinks",
  "sides",
  "lunch",
  "dinner",
  "menu",
  "specials",
  "套餐",
  "菜单",
  "主菜",
  "小吃",
  "甜品",
  "饮品",
];

// Price regex pattern
const PRICE_PATTERN = /\$?\d{1,2}(\.\d{2})?/g;

/**
 * Extract text from image buffer using OCR with timeout
 * @param {Buffer} buffer - Image buffer
 * @param {number} timeoutMs - Timeout in milliseconds (default: 2000)
 * @returns {Promise<Object>} OCR result with text, priceHits, and menuKeywords
 */
export async function extractTextFromImage(buffer, timeoutMs = 2000) {
  const tesseractFn = await getTesseract();
  if (!tesseractFn) {
    return {
      text: "",
      priceHits: 0,
      menuKeywords: [],
      error: "tesseract_not_available",
    };
  }

  return new Promise(async (resolve) => {
    const timeout = setTimeout(() => {
      resolve({
        text: "",
        priceHits: 0,
        menuKeywords: [],
        error: "timeout",
      });
    }, timeoutMs);

    try {
      const worker = await tesseractFn();
      await worker.loadLanguage("eng");
      await worker.initialize("eng");

      const {
        data: { text },
      } = await worker.recognize(buffer);
      await worker.terminate();

      clearTimeout(timeout);

      // Extract price hits
      const priceMatches = text.match(PRICE_PATTERN) || [];
      const priceHits = priceMatches.length;

      // Extract menu keywords
      const lowerText = text.toLowerCase();
      const menuKeywords = MENU_KEYWORDS.filter((keyword) =>
        lowerText.includes(keyword.toLowerCase())
      );

      resolve({
        text,
        priceHits,
        menuKeywords,
        error: null,
      });
    } catch (error) {
      clearTimeout(timeout);
      resolve({
        text: "",
        priceHits: 0,
        menuKeywords: [],
        error: error.message,
      });
    }
  });
}

/**
 * Get OCR boost score based on price hits and menu keywords
 * @param {number} priceHits - Number of price matches found
 * @param {Array} menuKeywords - Array of menu keywords found
 * @returns {Object} Boost scores and breakdown
 */
export function getOcrBoost(priceHits, menuKeywords) {
  let priceBoost = 0;
  let keywordBoost = 0;

  // Price boost: +10 if >= 3 price hits
  if (priceHits >= 3) {
    priceBoost = 10;
  }

  // Keyword boost: +5 if any menu keywords found
  if (menuKeywords.length > 0) {
    keywordBoost = 5;
  }

  return {
    priceBoost,
    keywordBoost,
    totalBoost: priceBoost + keywordBoost,
  };
}

