import { motion } from 'motion/react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { pageVariants } from '@/animations/pageTransitions';

/**
 * Main layout wrapping pages with Navbar, Footer, and page transition animations.
 */
export function MainLayout({ children, noFooter = false }) {
  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: 'var(--cw-bg)' }}>
      <Navbar />
      <motion.div
        className="pt-24"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        {children}
      </motion.div>
      {!noFooter && <Footer />}
    </div>
  );
}
