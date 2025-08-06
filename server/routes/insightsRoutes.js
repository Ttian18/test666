import express from "express";
const router = express.Router();

// Placeholder for GET /insights/summary
router.get("/summary", (req, res) => {
  res
    .status(200)
    .json({ message: "Endpoint for spending insights and summaries" });
});

export default router;
