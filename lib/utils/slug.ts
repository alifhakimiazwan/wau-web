/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A URL-safe slug
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Remove accents/diacritics
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Replace spaces and special chars with hyphens
    .replace(/[^a-z0-9]+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, "")
    // Collapse multiple hyphens
    .replace(/-+/g, "-")
    // Limit length
    .substring(0, 100);
}

/**
 * Validate if a slug is safe and non-empty
 * @param slug - The slug to validate
 * @returns True if valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length === 0) return false;
  // Only allow lowercase letters, numbers, and hyphens
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

/**
 * Generate a fallback slug when the generated one is invalid
 * @returns A timestamped fallback slug
 */
export function getFallbackSlug(): string {
  return `product-${Date.now()}`;
}
