import "dotenv/config";
import { getRestaurantRecommendations } from "../services/recommendationService.mjs";

async function main() {
  const query =
    process.argv.slice(2).join(" ") ||
    "Find 3 quiet seafood restaurants in West LA, avoid chains, good for a calm lunch.";
  console.log("Query:", query);
  const res = await getRestaurantRecommendations(query);
  console.log(
    "\nStructured answer (array):\n",
    JSON.stringify(res.answer, null, 2)
  );
  console.log("\nRaw agent answer:\n", res.rawAnswer);
  console.log(
    "\nIntermediate steps (truncated):\n",
    Array.isArray(res.steps) ? res.steps.slice(0, 3) : res.steps
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
