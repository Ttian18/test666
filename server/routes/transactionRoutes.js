import express from "express";
const router = express.Router();

// Placeholder for POST /transactions/upload
router.post("/upload", (req, res) => {
  res
    .status(200)
    .json({ message: "Endpoint for AI voucher/receipt recognition" });
});

// Placeholder for PUT /transactions/:id
router.put("/:id", (req, res) => {
  res
    .status(200)
    .json({
      message: `Endpoint to update transaction with id ${req.params.id}`,
    });
});

export default router;
