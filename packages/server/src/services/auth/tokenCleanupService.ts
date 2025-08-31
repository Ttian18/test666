import tokenBlacklistService from "./tokenBlacklistService.ts";

class TokenCleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private lastCleanupTime?: Date;

  constructor() {
    this.cleanupInterval = null;
  }

  /**
   * Start the periodic cleanup service
   * @param intervalHours - Hours between cleanup runs (default: 24)
   */
  startCleanup(intervalHours: number = 24): void {
    if (this.cleanupInterval) {
      console.log("Token cleanup service already running");
      return;
    }

    const intervalMs = intervalHours * 60 * 60 * 1000;

    // Run initial cleanup (handle promise properly)
    this.performCleanup().catch((error) => {
      console.error("Error during initial token cleanup:", error);
    });

    // Schedule periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.performCleanup().catch((error) => {
        console.error("Error during scheduled token cleanup:", error);
      });
    }, intervalMs);

    console.log(
      `Token cleanup service started (runs every ${intervalHours} hours)`
    );
  }

  /**
   * Stop the periodic cleanup service
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log("Token cleanup service stopped");
    }
  }

  /**
   * Perform the actual cleanup operation
   */
  async performCleanup(): Promise<void> {
    try {
      console.log("Starting token cleanup...");
      const cleanedCount = await tokenBlacklistService.cleanupExpiredTokens();
      this.lastCleanupTime = new Date();
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
  getStatus(): { isRunning: boolean; lastCleanup?: Date } {
    return {
      isRunning: !!this.cleanupInterval,
      lastCleanup: this.lastCleanupTime,
    };
  }
}

export default new TokenCleanupService();
