import { cn } from '@/utils/cn';

/**
 * Color-coded badge/chip component.
 */
export function Badge({ children, variant = 'default', className, style, ...props }) {
  const baseStyles = (() => {
    switch (variant) {
      case 'primary':
        return {
          background: 'color-mix(in srgb, var(--cw-button) 18%, transparent)',
          color: 'var(--cw-button)',
        };
      case 'accent':
        return {
          background: 'color-mix(in srgb, var(--cw-accent) 25%, transparent)',
          color: '#7D1038',
        };
      case 'glass':
        return {
          background: 'color-mix(in srgb, white 18%, transparent)',
          color: '#FFF6EC',
          backdropFilter: 'blur(8px)',
        };
      default:
        return {
          background: 'var(--cw-bg)',
          color: 'var(--cw-text)',
        };
    }
  })();

  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium', className)}
      style={{ ...baseStyles, ...style }}
      {...props}
    >
      {children}
    </span>
  );
}
