import express from "express";
const router = express.Router();

// Placeholder for POST /profile
router.post("/", (req, res) => {
  res.status(200).json({ message: "Endpoint to create a user profile" });
});

// Placeholder for GET /profile
router.get("/", (req, res) => {
  res.status(200).json({ message: "Endpoint to get a user profile" });
});

export default router;
