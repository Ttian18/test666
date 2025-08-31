import tokenBlacklistService from "./tokenBlacklistService.js";

class TokenCleanupService {
  constructor() {
    this.cleanupInterval = null;
  }

  /**
   * Start the periodic cleanup service
   * @param {number} intervalHours - Hours between cleanup runs (default: 24)
   */
  startCleanup(intervalHours = 24) {
    if (this.cleanupInterval) {
      console.log("Token cleanup service already running");
      return;
    }

    const intervalMs = intervalHours * 60 * 60 * 1000;

    // Run initial cleanup
    this.performCleanup();

    // Schedule periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, intervalMs);

    console.log(
      `Token cleanup service started (runs every ${intervalHours} hours)`
    );
  }

  /**
   * Stop the periodic cleanup service
   */
  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log("Token cleanup service stopped");
    }
  }

  /**
   * Perform the actual cleanup operation
   */
  async performCleanup() {
    try {
      console.log("Starting token cleanup...");
      const cleanedCount = await tokenBlacklistService.cleanupExpiredTokens();
      console.log(
        `Token cleanup completed: ${cleanedCount} expired tokens removed`
      );
    } catch (error) {
      console.error("Error during token cleanup:", error);
    }
  }

  /**
   * Get cleanup service status
   */
  getStatus() {
    return {
      isRunning: !!this.cleanupInterval,
      lastCleanup: this.lastCleanupTime,
    };
  }
}

export default new TokenCleanupService();
