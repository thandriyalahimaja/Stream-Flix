import { motion } from 'motion/react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'text-white',
  secondary: '',
  ghost: '',
  danger: 'text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3 text-base rounded-full gap-2',
};

/**
 * Reusable button with variants, sizes, loading, and motion animations.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className,
  style,
  ...props
}) {
  const baseStyle = (() => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--cw-button)',
          boxShadow: '0 10px 30px -10px var(--cw-button)',
        };
      case 'secondary':
        return {
          background: 'color-mix(in srgb, var(--cw-card) 70%, transparent)',
          color: 'var(--cw-text)',
          backdropFilter: 'blur(12px)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--cw-text2)',
        };
      case 'danger':
        return {
          background: '#ef4444',
          boxShadow: '0 10px 30px -10px #ef4444',
        };
      default:
        return {};
    }
  })();

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all',
        sizes[size],
        variants[variant],
        (disabled || loading) && 'opacity-60 cursor-not-allowed',
        className
      )}
      style={{ ...baseStyle, ...style }}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </motion.button>
  );
}
