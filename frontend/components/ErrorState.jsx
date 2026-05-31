import { motion } from 'motion/react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './ui/Button';

/**
 * Reusable error screen component for Home, Browse, Dashboard, Search, and Profile pages.
 */
export default function ErrorState({
  title = 'Something went wrong',
  error,
  onRetry,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center py-20 px-6 max-w-md mx-auto"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center border border-dashed mb-6"
        style={{
          borderColor: 'var(--cw-button, #E23C64)',
          background: 'color-mix(in srgb, var(--cw-button, #E23C64) 8%, transparent)',
          color: 'var(--cw-button, #E23C64)',
        }}
      >
        <AlertCircle size={28} />
      </div>

      <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--cw-text, #FFF)' }}>
        {title}
      </h3>

      {error && (
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--cw-text2, #9E9498)' }}>
          {typeof error === 'object' ? error.message || JSON.stringify(error) : error}
        </p>
      )}

      {onRetry && (
        <div className="mt-8">
          <Button onClick={onRetry} icon={<RotateCcw size={16} />}>
            Try Again
          </Button>
        </div>
      )}
    </motion.div>
  );
}
