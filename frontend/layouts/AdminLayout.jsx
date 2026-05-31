import { motion } from 'motion/react';
import { Navbar } from '@/components/Navbar';
import { pageVariants } from '@/animations/pageTransitions';

/**
 * Admin layout — Navbar + full-width content (no footer for admin panels).
 */
export function AdminLayout({ children }) {
  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: 'var(--cw-bg)' }}>
      <Navbar />
      <motion.div
        className="pt-24 pb-12"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        {children}
      </motion.div>
    </div>
  );
}
