# Postman Test Examples for User-Defined Negative Tags

## 1. Upload Image Flow with Dynamic Negatives

### Request

```
POST http://localhost:5001/restaurants/menu-analysis/recommend
Content-Type: multipart/form-data

Form Data:
- image: [menu_image.jpg]
- budget: 25
- tags: "noChicken, dairy-free, spicy"
```

### Expected Response

```json
{
  "menuInfo": {
    "items": [
      // Filtered items (chicken and dairy items excluded)
    ]
  },
  "recommendation": {
    "picks": [
      {
        "name": "Vegan Salad",
        "quantity": 1,
        "reason": "Fits dietary constraints and budget"
      }
    ],
    "estimatedTotal": 12,
    "notes": "Selected items avoiding chicken and dairy",
    "filteredOut": [
      {
        "name": "Chicken Parmesan",
        "reason": "dynamic_exclude"
      }
    ]
  },
  "tagsApplied": ["nochicken", "dairyfree", "spicy"],
  "hardConstraints": ["no:chicken", "no:dairy"],
  "softPreferences": ["spicy"],
  "removedByTags": 2,
  "filterDebug": [
    {
      "itemName": "Chicken Parmesan",
      "reason": "dynamic_exclude",
      "tag": "no:chicken",
      "matched": "chicken"
    }
  ]
}
```

## 2. PlaceId Flow with Mixed Constraints

### Request

```
POST http://localhost:5001/restaurants/menu-analysis/from-place/ChIJN1t_tDeuEmsRUsoyG83frY4/menu-recommendation
Content-Type: application/json

{
  "budget": 30,
  "tags": ["vegan", "noNuts", "spicy"]
}
```

### Expected Response

```json
{
  "place": {
    "id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "name": "Restaurant Name"
  },
  "menuInfo": {
    "items": [
      // Items filtered by vegan + no nuts
    ]
  },
  "recommendation": {
    "picks": [
      {
        "name": "Spicy Vegan Curry",
        "quantity": 1,
        "reason": "Vegan, nut-free, and spicy as requested"
      }
    ]
  },
  "tagsApplied": ["vegan", "nonuts", "spicy"],
  "hardConstraints": ["vegan", "no:nuts"],
  "softPreferences": ["spicy"]
}
```

## 3. Rebudget with New Tags

### Request

```
POST http://localhost:5001/restaurants/menu-analysis/rebudget
Content-Type: application/json

{
  "budget": 20,
  "tags": ["noBeef", "glutenfree"]
}
```

### Expected Response

```json
{
  "menuInfo": {
    "items": [
      // Cached menu items
    ]
  },
  "recommendation": {
    "picks": [
      {
        "name": "Gluten-Free Pasta",
        "quantity": 1,
        "reason": "No beef, gluten-free, within budget"
      }
    ],
    "estimatedTotal": 18
  },
  "tagsApplied": ["nobeef", "glutenfree"],
  "hardConstraints": ["glutenfree", "no:beef"],
  "softPreferences": []
}
```

## 4. Test Different Negative Patterns

### Pattern 1: noX

```
tags: "noChicken, noDairy"
```

### Pattern 2: no-X

```
tags: "no-chicken, no-dairy"
```

### Pattern 3: avoid X

```
tags: "avoid chicken, avoid dairy"
```

### Pattern 4: exclude X

```
tags: "exclude nuts, exclude shellfish"
```

### Pattern 5: X-free

```
tags: "dairy-free, nut-free"
```

## 5. Test Cache Behavior

### First Request (Cache Miss)

```
POST /menu-analysis/recommend
tags: "noChicken"
```

### Second Request (Cache Hit)

```
POST /menu-analysis/recommend
tags: "noChicken"
// Should return cached result
```

### Third Request (Cache Miss - Different Tags)

```
POST /menu-analysis/recommend
tags: "noBeef"
// Should NOT return cached result, should recompute
```

## 6. Test Soft Preferences Only

### Request

```
POST /menu-analysis/recommend
tags: "spicy, sichuan, lowcarb"
```

### Expected Behavior

- No hard filtering (all items allowed)
- LLM should prefer spicy/Sichuan items in ranking
- Low-carb preference influences selection

## 7. Test Mixed Hard and Soft

### Request

```
POST /menu-analysis/recommend
tags: "vegan, spicy, noNuts"
```

### Expected Behavior

- Hard constraints: vegan + no nuts (excludes items)
- Soft preference: spicy (influences ranking of remaining items)
