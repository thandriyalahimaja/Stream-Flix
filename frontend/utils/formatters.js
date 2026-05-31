/**
 * Formatting utilities
 */

/**
 * Format a number with commas (e.g., 12438 → "12,438")
 */
export function formatNumber(num) {
  if (num == null) return '0';
  return Number(num).toLocaleString('en-US');
}

/**
 * Format duration string (e.g., "2h 14m")
 */
export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

/**
 * Format rating with one decimal (e.g., 8.9)
 */
export function formatRating(rating) {
  return Number(rating).toFixed(1);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength = 120) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}

/**
 * Get greeting based on time of day
 */
export function getGreeting() {
  const currentHour = new Date().getHours();
  if (currentHour < 5) return 'Still up?';
  if (currentHour < 12) return 'Good morning';
  if (currentHour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Relative time string (e.g., "2 hours ago")
 */
export function timeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}
