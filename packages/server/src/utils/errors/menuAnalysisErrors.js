// Error constants for consistent error handling across the application
export const ERROR_CODES = {
  NO_MENU_ITEMS: "NO_MENU_ITEMS",
  MISSING_IMAGE: "MISSING_IMAGE",
  INVALID_MIMETYPE: "INVALID_MIMETYPE",
  IMAGE_TOO_LARGE: "IMAGE_TOO_LARGE",
  INVALID_BUDGET: "INVALID_BUDGET",
  MISSING_IMAGE_BUFFER: "MISSING_IMAGE_BUFFER",
  NO_CACHE: "NO_CACHE",
  VISION_API_ERROR: "VISION_API_ERROR",
  BUDGET_API_ERROR: "BUDGET_API_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  INVALID_ID: "INVALID_ID",
  NOT_FOUND: "NOT_FOUND",
};

// Error mapping to HTTP status codes
export const ERROR_STATUS_MAP = {
  [ERROR_CODES.NO_MENU_ITEMS]: 422,
  [ERROR_CODES.MISSING_IMAGE]: 400,
  [ERROR_CODES.INVALID_MIMETYPE]: 400,
  [ERROR_CODES.IMAGE_TOO_LARGE]: 413,
  [ERROR_CODES.INVALID_BUDGET]: 400,
  [ERROR_CODES.MISSING_IMAGE_BUFFER]: 400,
  [ERROR_CODES.NO_CACHE]: 404,
  [ERROR_CODES.VISION_API_ERROR]: 500,
  [ERROR_CODES.BUDGET_API_ERROR]: 500,
  [ERROR_CODES.INTERNAL_ERROR]: 500,
  [ERROR_CODES.INVALID_ID]: 400,
  [ERROR_CODES.NOT_FOUND]: 404,
};

// Custom error class for application errors
export class AppError extends Error {
  constructor(code, message, originalError = null) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = ERROR_STATUS_MAP[code] || 500;
    this.originalError = originalError;
  }
}

// Helper function to create specific error types
export const createError = {
  noMenuItems: (message = "No menu items could be extracted from the image") =>
    new AppError(ERROR_CODES.NO_MENU_ITEMS, message),

  missingImage: (message = 'Missing image file in field "image"') =>
    new AppError(ERROR_CODES.MISSING_IMAGE, message),

  invalidMimeType: (message = "Invalid image mime type") =>
    new AppError(ERROR_CODES.INVALID_MIMETYPE, message),

  imageTooLarge: (message = "Image file too large. Maximum size is 6MB.") =>
    new AppError(ERROR_CODES.IMAGE_TOO_LARGE, message),

  invalidBudget: (message = "Invalid budget. Provide a positive number.") =>
    new AppError(ERROR_CODES.INVALID_BUDGET, message),

  missingImageBuffer: (message = "Missing image buffer or mime type") =>
    new AppError(ERROR_CODES.MISSING_IMAGE_BUFFER, message),

  noCache: (
    message = "No cached menu available. Please upload a menu first."
  ) => new AppError(ERROR_CODES.NO_CACHE, message),

  visionApiError: (message = "Vision API error", originalError = null) =>
    new AppError(ERROR_CODES.VISION_API_ERROR, message, originalError),

  budgetApiError: (message = "Budget API error", originalError = null) =>
    new AppError(ERROR_CODES.BUDGET_API_ERROR, message, originalError),

  internalError: (message = "Internal server error", originalError = null) =>
    new AppError(ERROR_CODES.INTERNAL_ERROR, message, originalError),

  invalidId: (message = "Invalid ID format") =>
    new AppError(ERROR_CODES.INVALID_ID, message),

  notFound: (message = "Resource not found") =>
    new AppError(ERROR_CODES.NOT_FOUND, message),
};

// Helper function to handle errors and return appropriate HTTP response
export const handleError = (error, res) => {
  console.error("Error:", error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
    });
  }

  // Handle plain error objects (for backwards compatibility)
  if (error && typeof error === 'object' && error.statusCode && error.code) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
    });
  }

  // For unknown errors, return 500
  return res.status(500).json({
    error: "Internal server error",
    code: ERROR_CODES.INTERNAL_ERROR,
  });
};
