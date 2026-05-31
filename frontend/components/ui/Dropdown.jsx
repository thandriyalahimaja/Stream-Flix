import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/utils/cn';

/**
 * Click-triggered dropdown menu with animations.
 */
export function Dropdown({ trigger, children, align = 'right', className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(!open)} role="button" tabIndex={0}>
        {trigger}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 mt-2 min-w-[180px] rounded-xl overflow-hidden shadow-xl',
              align === 'right' ? 'right-0' : 'left-0',
              className
            )}
            style={{
              background: 'var(--cw-card)',
              border: '1px solid color-mix(in srgb, var(--cw-text) 12%, transparent)',
            }}
            onClick={() => setOpen(false)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Dropdown menu item.
 */
export function DropdownItem({ children, icon, danger, onClick, ...props }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:opacity-80"
      style={{
        color: danger ? '#ef4444' : 'var(--cw-text)',
        background: 'transparent',
      }}
      {...props}
    >
      {icon && <span style={{ color: danger ? '#ef4444' : 'var(--cw-text2)' }}>{icon}</span>}
      {children}
    </button>
  );
}

/**
 * Dropdown separator line.
 */
export function DropdownSeparator() {
  return (
    <div
      className="my-1 h-px"
      style={{ background: 'color-mix(in srgb, var(--cw-text) 10%, transparent)' }}
    />
  );
}
