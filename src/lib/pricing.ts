/**
 * Calculates a fake original price and a deterministic discount percentage (3-8%)
 * to show on the frontend for marketing purposes.
 */
export function getPriceDetails(price: number | null) {
  if (!price || price <= 0) return null;

  // Use the price itself to generate a deterministic "random" percentage.
  // This avoids hydration mismatches between server and client.
  const seed = (price * 123) % 1000;
  const randomPercent = (seed % 6) + 3; // (0-5) + 3 = 3-8%
  
  // DisplayedOriginal = price * (1 + randomPercent / 100)
  const originalPrice = Math.round(price * (1 + randomPercent / 100));
  
  return {
    discountedPrice: price,
    originalPrice: originalPrice,
    percentOff: randomPercent
  };
}
