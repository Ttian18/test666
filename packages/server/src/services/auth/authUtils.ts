import jwt from "jsonwebtoken";
import * as profileService from "./profileService.js";

/**
 * Attempt to authenticate user from JWT token (optional authentication)
 * @param {string} token - JWT token from request header
 * @returns {Promise<Object|null>} User data if authenticated, null if not
 */
export const optionalAuthenticate = async (token) => {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_secure_secret"
    );

    // Validate user exists and get user data
    const user = await profileService.validateUser(decoded.id);

    return user;
  } catch (error) {
    // Ignore auth errors for optional authentication
    console.log("Optional auth failed:", error.message);
    return null;
  }
};

/**
 * Get user data for personalization (includes profile data)
 * @param {string} token - JWT token from request header
 * @returns {Promise<Object|null>} User data with profile if available, null if not authenticated
 */
export const getUserForPersonalization = async (token) => {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_secure_secret"
    );

    // Get user data with profile for personalization
    const userData = await profileService.getUserDataForPersonalization(
      decoded.id
    );

    return userData;
  } catch (error) {
    // Ignore auth errors for optional authentication
    console.log("Optional auth failed:", error.message);
    return null;
  }
};
