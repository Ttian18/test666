// Auth-related type definitions and interfaces

export const UserRoles = {
  USER: "user",
  ADMIN: "admin",
  MODERATOR: "moderator",
};

export const AuthStatus = {
  PENDING: "pending",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  DELETED: "deleted",
};

// User entity interface
export const UserInterface = {
  id: "number",
  email: "string",
  password: "string",
  profileComplete: "boolean",
  role: "string",
  status: "string",
  createdAt: "Date",
  updatedAt: "Date",
};

// Profile entity interface
export const ProfileInterface = {
  id: "number",
  userId: "number",
  firstName: "string",
  lastName: "string",
  phone: "string",
  address: "string",
  preferences: "object",
  createdAt: "Date",
  updatedAt: "Date",
};

// Login request interface
export const LoginRequestInterface = {
  email: "string",
  password: "string",
};

// Register request interface
export const RegisterRequestInterface = {
  email: "string",
  password: "string",
  confirmPassword: "string",
};

// Auth response interface
export const AuthResponseInterface = {
  message: "string",
  userId: "number",
  token: "string",
  profileComplete: "boolean",
};
