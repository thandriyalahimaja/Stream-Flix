/**
 * Reusable transition presets for Framer Motion
 */

export const springBounce = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

export const springSmooth = {
  type: 'spring',
  stiffness: 300,
  damping: 22,
};

export const springGentle = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
};

export const tweenFast = {
  type: 'tween',
  duration: 0.2,
  ease: 'easeOut',
};

export const tweenMedium = {
  type: 'tween',
  duration: 0.4,
  ease: 'easeOut',
};

export const tweenSlow = {
  type: 'tween',
  duration: 0.6,
  ease: 'easeOut',
};

export const tweenCinematic = {
  type: 'tween',
  duration: 1.2,
  ease: [0.25, 0.46, 0.45, 0.94],
};

export const easeOutQuart = [0.25, 1, 0.5, 1];

export const easeInOutQuint = [0.83, 0, 0.17, 1];
