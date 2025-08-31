import express from "express";
import cors from "cors";

const app = express();
const PORT = 5001;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "TypeScript server is running!" });
});

// Test auth routes (minimal)
app.post("/api/auth/test", (req, res) => {
  res.json({
    message: "Auth endpoint working",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test TypeScript server running on http://localhost:${PORT}`);
});
