// Simple test to verify API client functionality
console.log("=== Testing API Client ===");

// Test environment variable
console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);

// Test API client import
try {
  const {
    fetchRestaurants,
    recommendFromUpload,
    getLastRecommendation,
    clearCache,
  } = await import("../src/lib/api.js");
  console.log("✅ API client imported successfully");
  console.log(
    "Available functions:",
    Object.keys({
      fetchRestaurants,
      recommendFromUpload,
      getLastRecommendation,
      clearCache,
    })
  );
} catch (error) {
  console.error("❌ Failed to import API client:", error.message);
}

console.log("✅ API client test completed!");
