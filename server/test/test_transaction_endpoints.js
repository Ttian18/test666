import { execSync } from "child_process";
import fs from "fs";

const BASE_URL = "http://localhost:5001";
const IMAGE_PATH =
  "/Users/mutianzhang/Developer/test666/0aed200d-3a15-4386-a6f1-f3101d594029_IMG_0873.jpeg";
const USER_ID = 1; // Updated to use the correct user ID

function runCurl(command) {
  try {
    const result = execSync(command, { encoding: "utf8" });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function logTest(testName, result) {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`🧪 Testing: ${testName}`);
  console.log(`${"=".repeat(50)}`);

  if (result.success) {
    console.log("✅ SUCCESS");
    console.log("📄 Response:");
    console.log(result.data);
  } else {
    console.log("❌ FAILED");
    console.log("🚨 Error:");
    console.log(result.error);
  }
}

async function testAllEndpoints() {
  console.log("🚀 Starting Transaction Endpoints Test Suite");
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`👤 User ID: ${USER_ID}`);
  console.log(`🖼️  Image: ${IMAGE_PATH}`);

  // Test 1: Get vouchers (should be empty initially)
  logTest(
    "GET /transactions/vouchers",
    runCurl(`curl -sS "${BASE_URL}/transactions/vouchers?user_id=${USER_ID}"`)
  );

  // Test 2: Get transactions (should be empty initially)
  logTest(
    "GET /transactions/transactions",
    runCurl(
      `curl -sS "${BASE_URL}/transactions/transactions?user_id=${USER_ID}"`
    )
  );

  // Test 3: Upload receipt
  logTest(
    "POST /transactions/upload",
    runCurl(
      `curl -sS -X POST -F "receipt=@${IMAGE_PATH}" -F "user_id=${USER_ID}" "${BASE_URL}/transactions/upload"`
    )
  );

  // Wait a moment for processing
  console.log("\n⏳ Waiting 3 seconds for receipt processing...");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Test 4: Get vouchers again (should now have data)
  logTest(
    "GET /transactions/vouchers (after upload)",
    runCurl(`curl -sS "${BASE_URL}/transactions/vouchers?user_id=${USER_ID}"`)
  );

  // Test 5: Get transactions again (should now have data)
  logTest(
    "GET /transactions/transactions (after upload)",
    runCurl(
      `curl -sS "${BASE_URL}/transactions/transactions?user_id=${USER_ID}"`
    )
  );

  // Test 6: Get specific voucher (assuming ID 1 exists)
  logTest(
    "GET /transactions/voucher/1",
    runCurl(`curl -sS "${BASE_URL}/transactions/voucher/1"`)
  );

  // Test 7: Update voucher
  logTest(
    "PUT /transactions/voucher/1",
    runCurl(
      `curl -sS -X PUT -H "Content-Type: application/json" -d '{"merchant":"Updated Restaurant Name","total_amount":55.00}' "${BASE_URL}/transactions/voucher/1"`
    )
  );

  // Test 8: Confirm voucher (this creates a transaction)
  logTest(
    "POST /transactions/voucher/1/confirm",
    runCurl(
      `curl -sS -X POST -H "Content-Type: application/json" -d '{"category":"Dining"}' "${BASE_URL}/transactions/voucher/1/confirm"`
    )
  );

  // Test 9: Bulk upload (single file)
  logTest(
    "POST /transactions/voucher/bulk-upload",
    runCurl(
      `curl -sS -X POST -F "receipts=@${IMAGE_PATH}" -F "user_id=${USER_ID}" "${BASE_URL}/transactions/voucher/bulk-upload"`
    )
  );

  // Test 10: Final state check
  console.log("\n⏳ Waiting 2 seconds for bulk processing...");
  await new Promise((resolve) => setTimeout(resolve, 2000));

  logTest(
    "GET /transactions/vouchers (final state)",
    runCurl(`curl -sS "${BASE_URL}/transactions/vouchers?user_id=${USER_ID}"`)
  );

  logTest(
    "GET /transactions/transactions (final state)",
    runCurl(
      `curl -sS "${BASE_URL}/transactions/transactions?user_id=${USER_ID}"`
    )
  );

  console.log("\n🎉 Test suite completed!");
}

testAllEndpoints();
