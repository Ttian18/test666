// Common validation functions
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    throw new Error(`${fieldName} is required`);
  }
  return true;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }
  return true;
};

export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }
  return true;
};

export const validateName = (name) => {
  if (!name || name.trim() === "") {
    throw new Error("Name is required");
  }
  if (name.length > 100) {
    throw new Error("Name must be less than 100 characters");
  }
  return name.trim();
};

export const validateBudget = (budget) => {
  const numBudget = Number(budget);
  if (!Number.isFinite(numBudget) || numBudget <= 0) {
    throw new Error("Budget must be a positive number");
  }
  return numBudget;
};

export const validateLocation = (location) => {
  if (!location || location.trim() === "") {
    throw new Error("Location parameter is required");
  }
  return location.trim();
};

export const validateFile = (file, fieldName = "file") => {
  if (!file) {
    throw new Error(`No ${fieldName} uploaded`);
  }
  return true;
};

export const validateMimeType = (mimetype, allowedTypes) => {
  if (!allowedTypes.includes(mimetype)) {
    throw new Error(`Invalid file type: ${mimetype}`);
  }
  return true;
};

export const validateFileSize = (size, maxSize) => {
  if (size > maxSize) {
    throw new Error(
      `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`
    );
  }
  return true;
};

// Validation middleware factory
export const createValidationMiddleware = (validations) => {
  return (req, res, next) => {
    try {
      for (const validation of validations) {
        const { field, validator, source = "body" } = validation;
        const value = req[source][field];
        validator(value, field);
      }
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
};
