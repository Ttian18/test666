import OpenAI from "openai";
import { z } from "zod";

// Define the structured output schema
const DishPickSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string(),
  quantity: z.number().int().min(1).default(1),
  reason: z.string().max(120).optional(),
  estimatedCalories: z.number().optional(),
});

const LLMPlanSchema = z.object({
  filteredOut: z.array(
    z.object({
      name: z.string(),
      reason: z.string().max(80),
    })
  ),
  picks: z.array(DishPickSchema),
  estTotal: z.number().optional(),
  estimatedTotalCalories: z.number().optional(),
  notes: z.string().optional(),
  relaxedHard: z.boolean().optional(),
  calorie_relaxed: z.boolean().optional(),
});

// Guard validation schema
const GuardValidationSchema = z.object({
  violations: z.array(
    z.object({
      name: z.string(),
      reason: z.string().max(100),
      constraint: z.string(),
    })
  ),
  safe: z.array(z.string()),
});

/**
 * LLM Guard: Validate items against hard constraints using AI
 * @param {OpenAI} openai - OpenAI instance
 * @param {Array} items - Items to validate
 * @param {Array} hardConstraints - Hard constraints to check
 * @returns {Object} Validation result with violations and safe items
 */
async function aiHardGuard(openai, items, hardConstraints) {
  if (!hardConstraints || hardConstraints.length === 0) {
    return { violations: [], safe: items.map((item) => item.name) };
  }

  const constraintsString = hardConstraints.join(", ");
  const itemList = items
    .map((item) => `${item.name} | ${item.desc || ""}`)
    .join("\n");

  const systemPrompt = `You are a dietary constraint validator. Analyze menu items for violations of hard constraints.

HARD CONSTRAINTS TO CHECK: ${constraintsString}

Rules:
1. Be EXTREMELY strict - if ANY ingredient/component violates a constraint, flag it
2. Consider ALL possible variations and synonyms (e.g., "pollo" = chicken, "queso" = cheese, "hongos" = mushrooms)
3. Look for hidden ingredients in descriptions and preparation methods
4. For negative constraints (noX, avoid-X, X-free), check if the item contains ANY form of that ingredient
5. Consider common culinary terms, regional names, and preparation styles
6. Return JSON with violations[] and safe[] arrays ONLY
7. For violations: include item name, reason, and which constraint was violated

Examples:
- "noMushroom" should flag: "Stuffed Mushrooms", "Mushroom Risotto", "Wild Mushroom Soup"
- "noChicken" should flag: "Pollo Asado", "Chicken Wings", "Kung Pao Chicken"
- "dairy-free" should flag: "Cheese Pizza", "Cream Pasta", "Butter Chicken"`;

  const userPrompt = `Constraints: ${constraintsString}

Menu items:
${itemList}

Return JSON: { violations: [{name, reason, constraint}], safe: [item_names] }`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const text = response.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("Empty guard response");
    }

    const parsed = JSON.parse(text);
    return GuardValidationSchema.parse(parsed);
  } catch (error) {
    console.warn("LLM guard failed, allowing all items:", error.message);
    return { violations: [], safe: items.map((item) => item.name) };
  }
}

/**
 * Final validation guard for LLM picks
 * @param {OpenAI} openai - OpenAI instance
 * @param {Array} picks - LLM selected items
 * @param {Array} hardConstraints - Hard constraints to validate against
 * @returns {Object} Validation result with valid picks and violations
 */
async function finalValidationGuard(openai, picks, hardConstraints) {
  if (!hardConstraints || hardConstraints.length === 0) {
    return { validPicks: picks.map((pick) => pick.name), violations: [] };
  }

  const constraintsString = hardConstraints.join(", ");
  const pickList = picks
    .map((pick) => `${pick.name} | ${pick.quantity}`)
    .join("\n");

  const systemPrompt = `You are a final validator for selected menu items. Check if any picks violate hard constraints.

HARD CONSTRAINTS: ${constraintsString}

Rules:
1. Be EXTREMELY strict - any violation means the item must be removed
2. Consider ALL ingredients, preparation methods, and hidden components
3. For negative constraints (noX, avoid-X, X-free), check for ANY presence of that ingredient
4. Look for regional names, synonyms, and culinary variations
5. Consider the full dish name and any implied ingredients
6. Return JSON with validPicks[] and violations[] ONLY
7. For violations: include item name and specific constraint violated

Examples:
- "noMushroom" constraint should remove: "Stuffed Mushrooms", "Mushroom Risotto"
- "noChicken" constraint should remove: "Pollo Asado", "Chicken Wings"
- "dairy-free" constraint should remove: "Cheese Pizza", "Cream Pasta"`;

  const userPrompt = `Constraints: ${constraintsString}

Selected items:
${pickList}

Return JSON: { validPicks: [valid_item_names], violations: [{name, constraint}] }`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const text = response.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("Empty final validation response");
    }

    const parsed = JSON.parse(text);
    return GuardValidationSchema.parse(parsed);
  } catch (error) {
    console.warn(
      "Final validation guard failed, allowing all picks:",
      error.message
    );
    return { validPicks: picks.map((pick) => pick.name), violations: [] };
  }
}

/**
 * Backfill picks after violations are removed
 * @param {OpenAI} openai - OpenAI instance
 * @param {Array} remainingItems - Items not yet selected
 * @param {Array} currentPicks - Current valid picks
 * @param {Array} hardConstraints - Hard constraints
 * @param {Array} softPreferences - Soft preferences
 * @param {number} budget - Remaining budget
 * @param {Array} excludedItems - Items to explicitly exclude
 * @returns {Array} Additional picks to add
 */
async function backfillPicks(
  openai,
  remainingItems,
  currentPicks,
  hardConstraints,
  softPreferences,
  budget,
  excludedItems = []
) {
  if (remainingItems.length === 0) {
    return [];
  }

  const constraintsString = hardConstraints.join(", ");
  const preferencesString = softPreferences.join(", ");
  const excludedString =
    excludedItems.length > 0 ? `\nEXCLUDED: ${excludedItems.join(", ")}` : "";

  const itemList = remainingItems
    .map((item) => `${item.name} | ${item.price} | ${item.desc || ""}`)
    .join("\n");

  const systemPrompt = `You are a menu backfill selector. Choose additional items to complete the meal plan.

HARD CONSTRAINTS (MUST NOT VIOLATE): ${constraintsString}
SOFT PREFERENCES: ${preferencesString}
REMAINING BUDGET: $${budget}${excludedString}

Rules:
1. NEVER violate hard constraints
2. Stay within remaining budget
3. Consider soft preferences for ranking
4. Return JSON with picks[] array ONLY`;

  const userPrompt = `Budget: $${budget}
Constraints: ${constraintsString}
Preferences: ${preferencesString}

Available items:
${itemList}

Return JSON: { picks: [{name, quantity, reason}] }`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const text = response.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return [];
    }

    const parsed = JSON.parse(text);
    return parsed.picks || [];
  } catch (error) {
    console.warn("Backfill failed:", error.message);
    return [];
  }
}

/**
 * Rank and pack dishes using LLM with structured output and two-pass guard
 * @param {Object} params - Parameters for ranking
 * @param {Array} params.items - Array of menu items
 * @param {number} params.budget - Budget limit
 * @param {Array} params.tags - Dietary preference tags
 * @param {Array} params.hardConstraints - Hard constraints that must not be violated
 * @param {Array} params.softPreferences - Soft preferences that influence ranking
 * @param {Object} params.calories - Calories object with maxPerPerson
 * @returns {Object} LLM ranking plan with guard validation
 */
export async function rankDishesWithLLM({
  items,
  budget,
  tags,
  hardConstraints = [],
  softPreferences = [],
  calories,
}) {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      filteredOut: [],
      picks: [],
      estTotal: 0,
      notes: "No items available for ranking",
      guardViolations: [],
    };
  }

  // Check for OpenAI API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("OPENAI_API_KEY not configured, returning empty result");
    return {
      filteredOut: [],
      picks: [],
      estTotal: 0,
      notes: "OpenAI API key not configured",
      guardViolations: [],
    };
  }

  const openai = new OpenAI({ apiKey });

  // Prepare slim input for LLM (only essential fields)
  const slimItems = items.map((item) => ({
    id: item.id || item.name,
    name: item.name || "Unknown",
    price: item.price || 0,
    desc: (item.description || "").substring(0, 120),
    estKcal: item.estKcal || null,
  }));

  // FIRST PASS: AI Hard Guard
  console.log("Running AI hard guard...");
  const guardResult = await aiHardGuard(openai, slimItems, hardConstraints);
  const guardViolations = guardResult.violations;

  // Remove items flagged by guard
  const safeItems = slimItems.filter((item) =>
    guardResult.safe.includes(item.name)
  );

  console.log(
    `Guard removed ${guardViolations.length} items, ${safeItems.length} items remaining`
  );

  if (safeItems.length === 0) {
    return {
      filteredOut: guardViolations.map((v) => ({
        name: v.name,
        reason: v.reason,
      })),
      picks: [],
      estTotal: 0,
      notes: "All items removed by hard constraint guard",
      guardViolations,
    };
  }

  // Batch processing for large menus
  const batchSize = 50;
  let finalItems = safeItems;

  if (safeItems.length > batchSize) {
    // Process in batches and take top items from each batch
    const batches = [];
    for (let i = 0; i < safeItems.length; i += batchSize) {
      batches.push(safeItems.slice(i, i + batchSize));
    }

    const batchResults = [];
    for (const batch of batches) {
      try {
        const batchPlan = await processBatch(
          openai,
          batch,
          budget,
          hardConstraints,
          softPreferences,
          calories
        );
        batchResults.push(...batchPlan.picks);
      } catch (error) {
        console.warn("Batch processing failed:", error.message);
      }
    }

    // Final pass with top items from all batches
    finalItems = batchResults.slice(0, Math.min(batchResults.length, 30));
  }

  // Process final items
  const initialPlan = await processBatch(
    openai,
    finalItems,
    budget,
    hardConstraints,
    softPreferences,
    calories
  );

  // SECOND PASS: Final validation guard
  console.log("Running final validation guard...");
  const finalValidation = await finalValidationGuard(
    openai,
    initialPlan.picks,
    hardConstraints
  );

  // Remove violating picks
  const validPicks = initialPlan.picks.filter((pick) =>
    finalValidation.validPicks.includes(pick.name)
  );

  const finalViolations = finalValidation.violations;
  console.log(`Final guard removed ${finalViolations.length} picks`);

  // Backfill if we lost picks due to violations
  let finalPicks = validPicks;
  if (
    finalViolations.length > 0 &&
    validPicks.length < initialPlan.picks.length
  ) {
    console.log("Backfilling removed picks...");

    // Calculate remaining budget
    const usedBudget = validPicks.reduce((sum, pick) => {
      const item = finalItems.find((i) => i.name === pick.name);
      return sum + (item?.price || 0) * pick.quantity;
    }, 0);
    const remainingBudget = budget - usedBudget;

    // Get remaining items not yet selected
    const remainingItems = finalItems.filter(
      (item) =>
        !validPicks.some((pick) => pick.name === item.name) &&
        !guardViolations.some((v) => v.name === item.name)
    );

    // Get names of violating items to exclude
    const excludedItems = finalViolations.map((v) => v.name);

    if (remainingItems.length > 0 && remainingBudget > 0) {
      const backfillPicks = await backfillPicks(
        openai,
        remainingItems,
        validPicks,
        hardConstraints,
        softPreferences,
        remainingBudget,
        excludedItems
      );

      finalPicks = [...validPicks, ...backfillPicks];
    }
  }

  // Combine all violations
  const allViolations = [
    ...guardViolations.map((v) => ({
      name: v.name,
      reason: v.reason,
      phase: "guard",
    })),
    ...finalViolations.map((v) => ({
      name: v.name,
      reason: v.reason,
      phase: "final",
    })),
  ];

  // Recalculate total
  const estTotal = finalPicks.reduce((sum, pick) => {
    const item = finalItems.find((i) => i.name === pick.name);
    return sum + (item?.price || 0) * pick.quantity;
  }, 0);

  return {
    ...initialPlan,
    picks: finalPicks,
    estTotal,
    notes: `${initialPlan.notes || ""} Guard removed ${
      allViolations.length
    } violations`,
    guardViolations: allViolations,
  };
}

/**
 * Process a batch of items with LLM
 * @param {OpenAI} openai - OpenAI instance
 * @param {Array} items - Items to process
 * @param {number} budget - Budget limit
 * @param {Array} hardConstraints - Hard constraints
 * @param {Array} softPreferences - Soft preferences
 * @param {number} calories - Optional calorie limit
 * @returns {Object} LLM plan
 */
async function processBatch(
  openai,
  items,
  budget,
  hardConstraints,
  softPreferences,
  calories
) {
  const hardConstraintsString =
    hardConstraints.length > 0 ? hardConstraints.join(", ") : "none";
  const softPreferencesString =
    softPreferences.length > 0 ? softPreferences.join(", ") : "none";
  const calorieString = calories?.maxPerPerson
    ? `Calories: ${calories.maxPerPerson}`
    : "";

  // Create compact item list for prompt
  const itemList = items
    .map(
      (item) =>
        `${item.name} | ${item.price} | ${item.desc}${
          item.estKcal ? ` | ${item.estKcal}cal` : ""
        }`
    )
    .join("\n");

  const systemPrompt = `You are a precise menu planner. Return ONLY the specified JSON fields.

HARD CONSTRAINTS (MUST NOT VIOLATE):
- ${hardConstraintsString}
- If strictly impossible under budget/calories, return closest feasible plan and set notes: {relaxedHard:true, reason:'...'}

SOFT PREFERENCES (influence ranking but can be relaxed):
- ${softPreferencesString}

Rules:
1. NEVER violate hard constraints unless absolutely impossible
2. Keep total <= budget${
    calories?.maxPerPerson
      ? ` and total estimated calories <= ${calories.maxPerPerson}`
      : ""
  }
3. Prefer variety and soft preferences when possible
4. Output JSON { filteredOut[], picks[], estTotal, estimatedTotalCalories, notes, relaxedHard?, calorie_relaxed? } ONLY
5. For filteredOut: include items that violate hard constraints
6. For picks: select items that fit budget and constraints
7. For each pick: include estimatedCalories (numeric estimate)
8. If calorie limit impossible: set calorie_relaxed=true and return closest under budget`;

  const userPrompt = `Budget: $${budget}${
    calorieString ? `\n${calorieString}` : ""
  }
Hard Constraints: ${hardConstraintsString}
Soft Preferences: ${softPreferencesString}

Menu items:
${itemList}

Return JSON with filteredOut[], picks[], estTotal, estimatedTotalCalories, notes, relaxedHard, calorie_relaxed ONLY.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const text = response.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("Empty response from LLM");
    }

    // Parse and validate response
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      throw new Error(`Failed to parse LLM response: ${e.message}`);
    }

    // Validate with Zod schema
    const validated = LLMPlanSchema.parse(parsed);

    // Ensure estimated total is within budget
    if (validated.estTotal && validated.estTotal > budget) {
      validated.notes =
        (validated.notes || "") + " Warning: Estimated total exceeds budget";
    }

    return validated;
  } catch (error) {
    console.error("LLM ranking failed:", error.message);
    throw error;
  }
}
