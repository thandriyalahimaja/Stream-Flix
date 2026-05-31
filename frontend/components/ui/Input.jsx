import { cn } from '@/utils/cn';
import { forwardRef } from 'react';

/**
 * Styled input with label, error state, and icon support.
 */
export const Input = forwardRef(function Input(
  { label, error, icon, className, containerClassName, ...props },
  ref
) {
  return (
    <div className={cn('space-y-1', containerClassName)}>
      {label && (
        <label
          htmlFor={props.id || undefined}
          className="block text-xs font-medium"
          style={{ color: 'var(--cw-text2)' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--cw-text2)' }}
          >
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl outline-none transition-all',
            'focus:ring-2 focus:ring-[var(--cw-button)]/30',
            icon && 'pl-10',
            error && 'ring-2 ring-red-400/50',
            className
          )}
          style={{
            background: 'var(--cw-card)',
            color: 'var(--cw-text)',
          }}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
});
