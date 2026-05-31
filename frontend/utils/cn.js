/**
 * Classname merge utility
 * Combines multiple class strings, filtering out falsy values.
 * Lightweight replacement for clsx + tailwind-merge.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
