import { useState } from 'react';
import { cn } from '@/utils/cn';

/**
 * Simple hover tooltip.
 */
export function Tooltip({ children, content, position = 'top', className }) {
  const [show, setShow] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && content && (
        <div
          className={cn(
            'absolute z-50 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap',
            'pointer-events-none animate-in fade-in-0',
            positionClasses[position],
            className
          )}
          style={{
            background: 'var(--cw-text)',
            color: 'var(--cw-bg)',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
