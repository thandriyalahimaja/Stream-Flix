import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Button } from './ui/Button';

/**
 * Reusable empty state with illustration, message, and optional CTA.
 */
export function EmptyState({
  icon,
  title = 'Nothing here yet',
  description,
  actionLabel,
  actionTo,
  onAction,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-20 px-6"
    >
      {icon && (
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="mb-6"
          style={{ color: 'var(--cw-text2)', opacity: 0.6 }}
        >
          {icon}
        </motion.div>
      )}
      <h3 className="text-lg" style={{ color: 'var(--cw-text)' }}>{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm" style={{ color: 'var(--cw-text2)' }}>
          {description}
        </p>
      )}
      {(actionLabel && actionTo) && (
        <Link to={actionTo} className="mt-6">
          <Button>{actionLabel}</Button>
        </Link>
      )}
      {(actionLabel && onAction && !actionTo) && (
        <div className="mt-6">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </motion.div>
  );
}
