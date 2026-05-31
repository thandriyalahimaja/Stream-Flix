import { cn } from '@/utils/cn';

/**
 * Flexible card with glass variant and optional header/footer.
 */
export function Card({ children, glass = false, className, style, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden',
        glass ? 'glass-strong' : '',
        className
      )}
      style={{
        background: glass ? undefined : 'var(--cw-card)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('p-6 pb-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...props }) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
}
