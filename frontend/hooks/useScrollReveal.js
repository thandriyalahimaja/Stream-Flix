import { useRef, useEffect, useState } from 'react';

/**
 * Hook that tracks element visibility via IntersectionObserver.
 * Returns [ref, isVisible] — attach the ref to the target element.
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.once !== false) {
            observer.unobserve(element);
          }
        } else if (options.once === false) {
          setIsVisible(false);
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '-50px',
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options.once, options.threshold, options.rootMargin]);

  return [ref, isVisible];
}
