import crypto from "crypto";

// In-memory cache for the last recommendation
class RecommendationCache {
  constructor() {
    this.cache = null;
  }

  /**
   * Compute SHA-256 hash of the image buffer
   */
  computeMenuHash(imageBuffer) {
    return crypto.createHash("sha256").update(imageBuffer).digest("hex");
  }

  /**
   * Store the last recommendation in cache
   */
  setLastRecommendation({ imageBuffer, menuInfo, recommendation, budget }) {
    const menuHash = imageBuffer
      ? this.computeMenuHash(imageBuffer)
      : this.cache?.menuHash;
    const ts = Date.now();

    this.cache = {
      menuHash,
      menuInfo,
      recommendation,
      budget,
      ts,
    };
  }

  /**
   * Get the last recommendation from cache
   */
  getLastRecommendation() {
    return this.cache;
  }

  /**
   * Clear the cache
   */
  clear() {
    this.cache = null;
  }

  /**
   * Check if cache is empty
   */
  isEmpty() {
    return this.cache === null;
  }

  /**
   * Check if menu hash matches the cached one
   */
  hasSameMenu(imageBuffer) {
    if (this.isEmpty()) return false;
    const currentHash = this.computeMenuHash(imageBuffer);
    return this.cache.menuHash === currentHash;
  }

  /**
   * Check if budget matches the cached one
   */
  hasSameBudget(budget) {
    if (this.isEmpty()) return false;
    return this.cache.budget === budget;
  }

  /**
   * Get cached menu info
   */
  getCachedMenuInfo() {
    return this.cache?.menuInfo || null;
  }
}

// Export singleton instance
export default new RecommendationCache();
