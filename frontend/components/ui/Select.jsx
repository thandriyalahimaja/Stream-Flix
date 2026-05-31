import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Custom styled select dropdown.
 */
export function Select({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  className,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find((o) => (typeof o === 'string' ? o : o.value) === value);
  const displayLabel = selected
    ? typeof selected === 'string' ? selected : selected.label
    : placeholder;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center justify-between gap-2 w-full px-4 py-3 rounded-xl text-left transition-all',
          className
        )}
        style={{
          background: 'var(--cw-card)',
          color: value ? 'var(--cw-text)' : 'var(--cw-text2)',
        }}
      >
        <span className="truncate">{displayLabel}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown size={16} style={{ color: 'var(--cw-text2)' }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-xl max-h-60 overflow-y-auto"
            style={{
              background: 'var(--cw-card)',
              border: '1px solid color-mix(in srgb, var(--cw-text) 12%, transparent)',
            }}
          >
            {options.map((opt) => {
              const optValue = typeof opt === 'string' ? opt : opt.value;
              const optLabel = typeof opt === 'string' ? opt : opt.label;
              const isSelected = optValue === value;

              return (
                <button
                  key={optValue}
                  onClick={() => {
                    onChange?.(optValue);
                    setOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:opacity-80"
                  style={{
                    color: 'var(--cw-text)',
                    background: isSelected
                      ? 'color-mix(in srgb, var(--cw-button) 12%, transparent)'
                      : 'transparent',
                  }}
                >
                  {optLabel}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
