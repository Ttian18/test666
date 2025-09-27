export const findMerchantCategory = (merchantName: string): string => {
  // This is a dummy implementation.
  // In a real application, this would use a more sophisticated method
  // to categorize merchants.
  if (!merchantName) {
    return "Others";
  }
  const lowerCaseMerchant = merchantName.toLowerCase();
  if (lowerCaseMerchant.includes("food") || lowerCaseMerchant.includes("restaurant")) {
    return "Food & Dining";
  }
  if (lowerCaseMerchant.includes("grocery")) {
    return "Grocery";
  }
  if (lowerCaseMerchant.includes("gas") || lowerCaseMerchant.includes("fuel")) {
    return "Gas & Fuel";
  }
  if (lowerCaseMerchant.includes("shop") || lowerCaseMerchant.includes("store")) {
    return "Shopping";
  }
  return "Others";
};
