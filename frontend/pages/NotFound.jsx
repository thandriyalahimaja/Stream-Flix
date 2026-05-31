import { motion } from 'motion/react';
import { Link } from 'react-router';
import { MainLayout } from '@/layouts/MainLayout';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

export default function NotFound() {
  return (
    <MainLayout noFooter>
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-lg"
        >
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="leading-none font-bold"
            style={{ fontSize: 140, color: 'var(--cw-button)' }}
          >
            404
          </motion.div>
          <h1 className="mt-4 text-2xl font-bold" style={{ color: 'var(--cw-text)' }}>
            That scene was cut from the final edit.
          </h1>
          <p className="mt-3 text-sm" style={{ color: 'var(--cw-text2)' }}>
            The page you're looking for didn't make it past post-production. Let's get you back to the screening room.
          </p>
          <Link to={ROUTES.HOME} className="inline-block mt-7">
            <Button size="lg">Back to Home</Button>
          </Link>
        </motion.div>
      </div>
    </MainLayout>
  );
}
