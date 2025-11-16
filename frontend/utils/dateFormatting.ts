/**
 * Date Formatting Utilities
 * Shared utilities for formatting dates across the application
 */

/**
 * Formats "last worn" date into a human-readable string
 * Examples: "Today", "Yesterday", "2 days ago", "1 week ago", "3 months ago"
 * 
 * @param lastWornAt - ISO datetime string
 * @returns Formatted string or null if invalid
 */
export function formatLastWorn(lastWornAt?: string): string | null {
  if (!lastWornAt) return null;
  
  try {
    const lastWorn = new Date(lastWornAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastWorn.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  } catch {
    return null;
  }
}

/**
 * Formats "last worn" date with a fallback for "Never worn"
 * Used in detail screens where "Never worn" is more appropriate than null
 * 
 * @param lastWornAt - ISO datetime string
 * @returns Formatted string or "Never worn" if invalid
 */
export function formatLastWornWithFallback(lastWornAt?: string): string {
  const formatted = formatLastWorn(lastWornAt);
  return formatted || 'Never worn';
}

