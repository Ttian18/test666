import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// In-memory blacklist for tokens (for production, consider using Redis)
const tokenBlacklist = new Set();

class TokenBlacklistService {
  /**
   * Add a token to the blacklist
   * @param {string} token - The JWT token to blacklist
   * @param {number} userId - The user ID associated with the token
   * @returns {Promise<boolean>} - Success status
   */
  async blacklistToken(token, userId) {
    try {
      // Add to in-memory blacklist
      tokenBlacklist.add(token);

      // Store in database for persistence (optional)
      await prisma.blacklistedToken.create({
        data: {
          token,
          userId,
          blacklistedAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      console.error("Error blacklisting token:", error);
      return false;
    }
  }

  /**
   * Check if a token is blacklisted
   * @param {string} token - The JWT token to check
   * @returns {Promise<boolean>} - True if token is blacklisted
   */
  async isTokenBlacklisted(token) {
    try {
      // Check in-memory blacklist first
      if (tokenBlacklist.has(token)) {
        return true;
      }

      // Check database
      const blacklistedToken = await prisma.blacklistedToken.findUnique({
        where: { token },
      });

      return !!blacklistedToken;
    } catch (error) {
      console.error("Error checking token blacklist:", error);
      return false;
    }
  }

  /**
   * Clean up expired tokens from blacklist
   * @returns {Promise<number>} - Number of tokens cleaned up
   */
  async cleanupExpiredTokens() {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const result = await prisma.blacklistedToken.deleteMany({
        where: {
          blacklistedAt: {
            lt: oneWeekAgo,
          },
        },
      });

      return result.count;
    } catch (error) {
      console.error("Error cleaning up expired tokens:", error);
      return 0;
    }
  }

  /**
   * Get blacklist statistics
   * @returns {Promise<Object>} - Blacklist statistics
   */
  async getBlacklistStats() {
    try {
      const totalBlacklisted = await prisma.blacklistedToken.count();
      const recentBlacklisted = await prisma.blacklistedToken.count({
        where: {
          blacklistedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      return {
        totalBlacklisted,
        recentBlacklisted,
        inMemoryCount: tokenBlacklist.size,
      };
    } catch (error) {
      console.error("Error getting blacklist stats:", error);
      return {
        totalBlacklisted: 0,
        recentBlacklisted: 0,
        inMemoryCount: tokenBlacklist.size,
      };
    }
  }
}

export default new TokenBlacklistService();
