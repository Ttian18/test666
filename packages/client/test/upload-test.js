// Test upload functionality
console.log("=== Testing Upload Functionality ===");

// Test if we can create a file input
const input = document.createElement("input");
input.type = "file";
input.accept = "image/*";

console.log("✅ File input created successfully");
console.log("Input type:", input.type);
console.log("Input accept:", input.accept);

// Test mobile detection
const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
console.log("Is mobile device:", isMobile);

// Test camera capture support
if (input.capture !== undefined) {
  console.log("✅ Camera capture supported");
  input.capture = "environment";
  console.log("Camera capture set to:", input.capture);
} else {
  console.log("❌ Camera capture not supported");
}

console.log("✅ Upload test completed!");
