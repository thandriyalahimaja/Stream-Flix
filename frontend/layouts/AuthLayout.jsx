import { motion } from 'motion/react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

/**
 * Split-screen auth layout for Login/Register pages.
 * Left side: decorative branded panel. Right side: form content.
 */
export function AuthLayout({ children }) {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--cw-bg)' }}>
      {/* Decorative left panel */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 30% 30%, var(--cw-button) 0%, transparent 60%),
                         radial-gradient(ellipse at 80% 80%, var(--cw-accent) 0%, transparent 55%),
                         var(--cw-text)`,
          }}
        />
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center p-20"
        >
          <div style={{ color: 'var(--cw-card)' }}>
            <div className="mb-6" style={{ fontSize: 12, letterSpacing: 3 }}>CORAL WAVE</div>
            <div style={{ fontSize: 56, lineHeight: 1.05, fontWeight: 600 }}>
              Stories that<br />stay with you.
            </div>
            <p className="mt-6 max-w-sm" style={{ opacity: 0.8 }}>
              A handcrafted cinematic streaming experience. No algorithms shouting — just films worth your night.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right panel: form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <button
          onClick={toggle}
          className="absolute top-6 right-6 p-2 rounded-full transition-opacity hover:opacity-70"
          style={{ color: 'var(--cw-text)' }}
          aria-label="Toggle theme"
        >
          {theme === 'cream' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        {children}
      </div>
    </div>
  );
}
