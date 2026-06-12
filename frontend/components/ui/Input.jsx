import { cn } from '@/utils/cn';
import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Styled input with label, error state, icon support, and automatic password visibility toggle.
 */
export const Input = forwardRef(function Input(
  { label, error, icon, className, containerClassName, type, ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

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
          type={inputType}
          className={cn(
            'w-full px-4 py-3 rounded-xl outline-none transition-all',
            'focus:ring-2 focus:ring-[var(--cw-button)]/30',
            icon && 'pl-10',
            isPasswordType && 'pr-10',
            error && 'ring-2 ring-red-400/50',
            className
          )}
          style={{
            background: 'var(--cw-card)',
            color: 'var(--cw-text)',
          }}
          {...props}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors"
            style={{ color: 'var(--cw-text2)' }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
});
