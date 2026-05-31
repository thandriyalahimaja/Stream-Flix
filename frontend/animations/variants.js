/**
 * Reusable Framer Motion animation variants
 */

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 30 },
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
};

export const fadeInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const slideUp = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const hoverScale = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.97 },
};

export const hoverLift = {
  whileHover: { y: -8, scale: 1.02 },
  transition: { type: 'spring', stiffness: 300, damping: 22 },
};

export const cardHover = {
  whileHover: { y: -8, scale: 1.03 },
  transition: { type: 'spring', stiffness: 300, damping: 22 },
};

export const buttonHover = {
  whileHover: { scale: 1.04 },
  whileTap: { scale: 0.97 },
};

export const buttonPress = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
};

export const floatingAnimation = {
  animate: { y: [0, -20, 0] },
  transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
};

export const rotateWiggle = {
  animate: { rotate: [0, 8, -8, 0] },
  transition: { duration: 6, repeat: Infinity },
};

export const scrollReveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
};
