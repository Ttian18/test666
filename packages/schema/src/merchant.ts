export const findMerchantCategory = (merchantName: string): string => {
  if (!merchantName) {
    return "Other";
  }

  const lowerCaseMerchant = merchantName.toLowerCase();

  // Food & Dining
  if (
    lowerCaseMerchant.includes("food") ||
    lowerCaseMerchant.includes("restaurant") ||
    lowerCaseMerchant.includes("cafe") ||
    lowerCaseMerchant.includes("coffee") ||
    lowerCaseMerchant.includes("pizza") ||
    lowerCaseMerchant.includes("burger") ||
    lowerCaseMerchant.includes("kitchen") ||
    lowerCaseMerchant.includes("dining") ||
    lowerCaseMerchant.includes("bakery") ||
    lowerCaseMerchant.includes("deli") ||
    lowerCaseMerchant.includes("bar") ||
    lowerCaseMerchant.includes("pub") ||
    lowerCaseMerchant.includes("grill") ||
    lowerCaseMerchant.includes("bistro") ||
    lowerCaseMerchant.includes("eatery") ||
    lowerCaseMerchant.includes("grocery") ||
    lowerCaseMerchant.includes("supermarket") ||
    lowerCaseMerchant.includes("market") ||
    lowerCaseMerchant.includes("mcdonald") ||
    lowerCaseMerchant.includes("kfc") ||
    lowerCaseMerchant.includes("subway") ||
    lowerCaseMerchant.includes("starbucks") ||
    lowerCaseMerchant.includes("domino") ||
    lowerCaseMerchant.includes("taco") ||
    lowerCaseMerchant.includes("wendy") ||
    lowerCaseMerchant.includes("chipotle")
  ) {
    return "Food & Dining";
  }

  // Transportation
  if (
    lowerCaseMerchant.includes("gas") ||
    lowerCaseMerchant.includes("fuel") ||
    lowerCaseMerchant.includes("shell") ||
    lowerCaseMerchant.includes("exxon") ||
    lowerCaseMerchant.includes("chevron") ||
    lowerCaseMerchant.includes("bp") ||
    lowerCaseMerchant.includes("mobil") ||
    lowerCaseMerchant.includes("uber") ||
    lowerCaseMerchant.includes("lyft") ||
    lowerCaseMerchant.includes("taxi") ||
    lowerCaseMerchant.includes("parking") ||
    lowerCaseMerchant.includes("metro") ||
    lowerCaseMerchant.includes("transit") ||
    lowerCaseMerchant.includes("airline") ||
    lowerCaseMerchant.includes("airport")
  ) {
    return "Transportation";
  }

  // Shopping
  if (
    lowerCaseMerchant.includes("shop") ||
    lowerCaseMerchant.includes("store") ||
    lowerCaseMerchant.includes("mall") ||
    lowerCaseMerchant.includes("walmart") ||
    lowerCaseMerchant.includes("target") ||
    lowerCaseMerchant.includes("amazon") ||
    lowerCaseMerchant.includes("costco") ||
    lowerCaseMerchant.includes("retail") ||
    lowerCaseMerchant.includes("clothing") ||
    lowerCaseMerchant.includes("fashion") ||
    lowerCaseMerchant.includes("electronics") ||
    lowerCaseMerchant.includes("best buy") ||
    lowerCaseMerchant.includes("home depot") ||
    lowerCaseMerchant.includes("lowes")
  ) {
    return "Shopping";
  }

  // Entertainment
  if (
    lowerCaseMerchant.includes("movie") ||
    lowerCaseMerchant.includes("cinema") ||
    lowerCaseMerchant.includes("theater") ||
    lowerCaseMerchant.includes("netflix") ||
    lowerCaseMerchant.includes("spotify") ||
    lowerCaseMerchant.includes("game") ||
    lowerCaseMerchant.includes("entertainment") ||
    lowerCaseMerchant.includes("concert") ||
    lowerCaseMerchant.includes("event")
  ) {
    return "Entertainment";
  }

  // Subscriptions
  if (
    lowerCaseMerchant.includes("netflix") ||
    lowerCaseMerchant.includes("spotify") ||
    lowerCaseMerchant.includes("apple music") ||
    lowerCaseMerchant.includes("amazon prime") ||
    lowerCaseMerchant.includes("disney") ||
    lowerCaseMerchant.includes("hulu") ||
    lowerCaseMerchant.includes("subscription") ||
    lowerCaseMerchant.includes("monthly") ||
    lowerCaseMerchant.includes("adobe") ||
    lowerCaseMerchant.includes("microsoft 365") ||
    lowerCaseMerchant.includes("office 365")
  ) {
    return "Subscriptions";
  }

  // Utilities
  if (
    lowerCaseMerchant.includes("electric") ||
    lowerCaseMerchant.includes("water") ||
    lowerCaseMerchant.includes("internet") ||
    lowerCaseMerchant.includes("phone") ||
    lowerCaseMerchant.includes("utility") ||
    lowerCaseMerchant.includes("verizon") ||
    lowerCaseMerchant.includes("att") ||
    lowerCaseMerchant.includes("comcast") ||
    lowerCaseMerchant.includes("spectrum")
  ) {
    return "Utilities";
  }

  // Healthcare
  if (
    lowerCaseMerchant.includes("hospital") ||
    lowerCaseMerchant.includes("clinic") ||
    lowerCaseMerchant.includes("doctor") ||
    lowerCaseMerchant.includes("pharmacy") ||
    lowerCaseMerchant.includes("medical") ||
    lowerCaseMerchant.includes("health") ||
    lowerCaseMerchant.includes("cvs") ||
    lowerCaseMerchant.includes("walgreens") ||
    lowerCaseMerchant.includes("yoga") ||
    lowerCaseMerchant.includes("fitness") ||
    lowerCaseMerchant.includes("wellness") ||
    lowerCaseMerchant.includes("spa") ||
    lowerCaseMerchant.includes("massage") ||
    lowerCaseMerchant.includes("therapy")
  ) {
    return "Healthcare";
  }

  // Education
  if (
    lowerCaseMerchant.includes("school") ||
    lowerCaseMerchant.includes("university") ||
    lowerCaseMerchant.includes("college") ||
    lowerCaseMerchant.includes("education") ||
    lowerCaseMerchant.includes("tuition") ||
    lowerCaseMerchant.includes("book") ||
    lowerCaseMerchant.includes("library")
  ) {
    return "Education";
  }

  // Travel
  if (
    lowerCaseMerchant.includes("hotel") ||
    lowerCaseMerchant.includes("motel") ||
    lowerCaseMerchant.includes("airbnb") ||
    lowerCaseMerchant.includes("travel") ||
    lowerCaseMerchant.includes("booking") ||
    lowerCaseMerchant.includes("expedia") ||
    lowerCaseMerchant.includes("flight") ||
    lowerCaseMerchant.includes("vacation")
  ) {
    return "Travel";
  }

  // Housing
  if (
    lowerCaseMerchant.includes("rent") ||
    lowerCaseMerchant.includes("mortgage") ||
    lowerCaseMerchant.includes("property") ||
    lowerCaseMerchant.includes("landlord") ||
    lowerCaseMerchant.includes("housing") ||
    lowerCaseMerchant.includes("apartment") ||
    lowerCaseMerchant.includes("condo") ||
    lowerCaseMerchant.includes("hoa") ||
    lowerCaseMerchant.includes("management company")
  ) {
    return "Housing";
  }

  // Fitness & Wellness
  if (
    lowerCaseMerchant.includes("gym") ||
    lowerCaseMerchant.includes("yoga") ||
    lowerCaseMerchant.includes("fitness") ||
    lowerCaseMerchant.includes("pilates") ||
    lowerCaseMerchant.includes("crossfit") ||
    lowerCaseMerchant.includes("wellness") ||
    lowerCaseMerchant.includes("spa") ||
    lowerCaseMerchant.includes("massage") ||
    lowerCaseMerchant.includes("trainer")
  ) {
    return "Fitness & Wellness";
  }

  // Personal Care
  if (
    lowerCaseMerchant.includes("salon") ||
    lowerCaseMerchant.includes("barber") ||
    lowerCaseMerchant.includes("nail") ||
    lowerCaseMerchant.includes("beauty") ||
    lowerCaseMerchant.includes("cosmetic") ||
    lowerCaseMerchant.includes("skincare") ||
    lowerCaseMerchant.includes("hair")
  ) {
    return "Personal Care";
  }

  // Home & Garden
  if (
    lowerCaseMerchant.includes("hardware") ||
    lowerCaseMerchant.includes("home depot") ||
    lowerCaseMerchant.includes("lowes") ||
    lowerCaseMerchant.includes("garden") ||
    lowerCaseMerchant.includes("furniture") ||
    lowerCaseMerchant.includes("appliance") ||
    lowerCaseMerchant.includes("ikea") ||
    lowerCaseMerchant.includes("cleaning")
  ) {
    return "Home & Garden";
  }

  return "Other";
};
