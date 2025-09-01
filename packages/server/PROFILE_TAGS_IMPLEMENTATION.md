# Profile-Based Tag Implementation

This document describes the implementation of profile-based dining preference tags for dish recommendations in the menu analysis system.

## Overview

The system now automatically uses a user's profile dining preferences as default tags for dish recommendations when no explicit tags are provided. This provides a personalized experience while maintaining backward compatibility and allowing users to override preferences when needed.

## Key Features

### 1. Automatic Profile Detection

- **JWT Authentication**: Reads `req.user.id` via JWT token from `x-auth-token` header
- **Profile Fetching**: Uses `profileService.getByUserId(userId)` to fetch user profile
- **Graceful Fallback**: If profile fetch fails or user is unauthenticated, continues with hardcoded defaults

### 2. Tag Mapping System

- **Normalization**: Maps profile dining style preferences to internal tag format
- **Variation Support**: Handles common variations like "Vegan" → "vegan", "Gluten-free" → "glutenfree"
- **Case Insensitive**: Supports mixed case and spacing variations

### 3. Tag Merge Strategy

The system implements a priority-based tag selection:

1. **User Tags** (highest priority): If `request.tags` is provided, use these exclusively
2. **Profile Tags**: If no user tags and `ignoreProfileTags != true`, use mapped profile preferences
3. **Hard Defaults** (lowest priority): Fallback to `HARD_DEFAULT_TAGS` when profile is unavailable

### 4. Cache Integration

- **Tag-Aware Caching**: Cache keys include normalized tags and calories
- **Profile Changes**: Cache automatically invalidates when profile preferences change
- **Efficient Reuse**: Reuses cached menu analysis when only budget changes

## API Endpoints

### POST /restaurants/menu-analysis/recommend

- **New Parameters**:
  - `ignoreProfileTags`: Boolean to force use of hard defaults
  - `calories`: Optional calorie limit
- **Response Enhancement**:
  - `usedTags`: Array of tags actually applied
  - `tagSource`: Source of tags ('user', 'profile', 'defaults')

### POST /restaurants/menu-analysis/rebudget

- **Enhanced**: Now supports profile-based tags for budget recalculation
- **Cache Aware**: Uses cached menu info with new tag preferences

### POST /restaurants/menu-analysis/from-place/:placeId/menu-recommendation

- **Profile Integration**: Automatically applies profile preferences to place-based recommendations
- **Tag Transparency**: Returns which tags were used and their source

## Configuration

### HARD_DEFAULT_TAGS

```javascript
export const HARD_DEFAULT_TAGS = [
  "glutenfree",
  "vegan",
  "vegetarian",
  "halal",
  "kosher",
];
```

### Profile Tag Mapping

The system supports these common dining preferences:

- **Dietary**: Vegan, Vegetarian, Pescatarian, Keto, Paleo
- **Restrictions**: Gluten-free, Dairy-free, Nut-free, Shellfish-free
- **Religious**: Halal, Kosher
- **Health**: Low-carb, Low-sodium

## Error Handling

### Profile Fetch Failures

- **Database Errors**: Logged as warnings, continue with defaults
- **JWT Issues**: Invalid/expired tokens handled gracefully
- **Missing Profiles**: Users without profiles get hard defaults
- **Network Issues**: Timeouts and connection failures don't break requests

### Fallback Strategy

1. Try to fetch profile via JWT
2. If successful, map dining preferences to tags
3. If any step fails, continue with request tags or hard defaults
4. Never fail the request due to profile issues

## Client Integration

### New API Parameters

```typescript
interface RecommendationPayload {
  budget: number;
  tags?: string[];
  calories?: number;
  ignoreProfileTags?: boolean; // New parameter
}
```

### Enhanced Response

```typescript
interface MenuRecommendation {
  // ... existing fields ...
  usedTags?: string[]; // Tags actually applied
  tagSource?: "user" | "profile" | "defaults"; // Source of tags
}
```

### Usage Examples

```typescript
// Use profile preferences (default behavior)
const result = await recommendFromUpload(file, { budget: 25 });

// Force ignore profile, use hard defaults
const result = await recommendFromUpload(file, {
  budget: 25,
  ignoreProfileTags: true,
});

// Override with custom tags
const result = await recommendFromUpload(file, {
  budget: 25,
  tags: ["spicy", "asian"],
});
```

## Testing

Run the profile tags test:

```bash
cd packages/server
node test/profileTagsTest.js
```

This tests:

- Profile dining style mapping
- Tag determination strategy
- Edge cases and error handling

## Migration Notes

### Backward Compatibility

- **Existing Clients**: Continue to work without changes
- **New Features**: Optional parameters don't break existing functionality
- **Cache Behavior**: Existing cached recommendations remain valid

### Performance Impact

- **Profile Fetching**: Minimal overhead (single database query)
- **JWT Validation**: Standard JWT verification cost
- **Cache Efficiency**: Improved cache hit rates with profile-aware keys

## Future Enhancements

### Planned Features

1. **Profile Caching**: Cache user profiles to reduce database queries
2. **Preference Learning**: Track user choices to improve profile suggestions
3. **Dietary Restrictions**: Support for allergies and medical restrictions
4. **Cuisine Preferences**: Include cuisine type preferences in profile

### API Extensions

1. **Profile Endpoint**: Allow clients to fetch current dining preferences
2. **Preference Updates**: Real-time preference updates
3. **Bulk Operations**: Support for multiple preference categories

## Security Considerations

### JWT Handling

- **Secure Validation**: Proper JWT verification with database user validation
- **Error Masking**: Profile errors don't reveal user existence
- **Token Expiry**: Graceful handling of expired tokens

### Profile Access

- **User Isolation**: Users can only access their own profile data
- **Data Sanitization**: Profile data is sanitized before use
- **Audit Logging**: Profile access is logged for security monitoring
