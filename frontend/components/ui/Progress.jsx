import { cn } from '@/utils/cn';
import { motion } from 'motion/react';

/**
 * Animated progress bar.
 */
export function Progress({ value = 0, max = 100, size = 'md', className, color }) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);

  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div
      className={cn('w-full rounded-full overflow-hidden', heights[size], className)}
      style={{ background: 'color-mix(in srgb, var(--cw-text) 15%, transparent)' }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: color || 'var(--cw-button)' }}
      />
    </div>
  );
}
