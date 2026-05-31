import { cn } from '@/utils/cn';

/**
 * Avatar with image or fallback initials.
 */
export function Avatar({ src, alt, name, size = 'md', className, style, ...props }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
        style={style}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold',
        sizeClasses[size],
        className
      )}
      style={{
        background: 'linear-gradient(135deg, var(--cw-button), var(--cw-text2))',
        color: 'white',
        ...style,
      }}
      {...props}
    >
      {initials}
    </div>
  );
}
