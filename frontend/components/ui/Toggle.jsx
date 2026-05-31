import { motion } from 'motion/react';

/**
 * Animated toggle switch for theme or binary settings.
 */
export function Toggle({ checked, onChange, label, className }) {
  return (
    <button
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex items-center gap-3 ${className || ''}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <div
        className="relative w-14 h-7 rounded-full flex items-center px-1 transition-colors"
        style={{
          background: checked
            ? 'var(--cw-button)'
            : 'color-mix(in srgb, var(--cw-text) 20%, transparent)',
        }}
      >
        <motion.div
          animate={{ x: checked ? 26 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="w-5 h-5 rounded-full"
          style={{ background: 'var(--cw-accent)' }}
        />
      </div>
      {label && (
        <span className="text-sm" style={{ color: 'var(--cw-text)' }}>
          {label}
        </span>
      )}
    </button>
  );
}
