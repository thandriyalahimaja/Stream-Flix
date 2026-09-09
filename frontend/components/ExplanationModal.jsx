import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import aiService from '@/services/aiService';

/**
 * Accessible, Portal-based Modal for Grounded AI Recommendation Explanations.
 *
 * Enforces:
 * - On-demand fetching (never pre-fetched in bulk)
 * - Controlled chips vocabulary display (max 3 chips)
 * - 1-2 sentence concise explanation
 * - Zero internal weights/scores displayed
 * - Safe fallback state when API is unreachable
 */
export function ExplanationModal({ isOpen, onClose, movie, contextType = 'personalized', query = '' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const movieId = movie?._id || movie?.id;

  useEffect(() => {
    if (!isOpen || !movieId) {
      setData(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    aiService
      .explainRecommendation(movieId, { contextType, query })
      .then((res) => {
        if (!isMounted) return;
        if (res && res.data) {
          setData(res.data);
        } else {
          setError('Unable to load explanation.');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        const msg = err.response?.data?.message || err.message || 'Unable to retrieve explanation.';
        setError(msg);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, movieId, contextType, query]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="explanation-title"
          className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-white z-10 overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #1e1b18 0%, #12100e 100%)',
            borderColor: 'rgba(255, 140, 66, 0.25)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm tracking-wide uppercase">
              <Sparkles size={16} />
              <span>Why This Movie?</span>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Movie Summary */}
          <div className="mt-3">
            <h3 id="explanation-title" className="text-lg font-bold text-neutral-100">
              {movie?.title || 'Selected Title'}
            </h3>
            <p className="text-xs text-neutral-400">
              {movie?.year ? `${movie.year} · ` : ''}
              {(movie?.genres || []).slice(0, 3).join(', ')}
            </p>
          </div>

          {/* Body Content */}
          <div className="mt-4 min-h-[100px]">
            {loading && (
              <div className="flex flex-col items-center justify-center py-6 gap-3 text-neutral-400">
                <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Analyzing recommendation signals...</span>
              </div>
            )}

            {!loading && error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-200 text-xs mt-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Could not load tailored explanation.</p>
                  <p className="opacity-80 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && data && (
              <div className="space-y-3 mt-1">
                {/* Headline */}
                <div className="text-sm font-semibold text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="shrink-0 text-amber-500" />
                  <span>{data.headline || 'Recommendation Justification'}</span>
                </div>

                {/* Grounded Reason (1-2 sentences) */}
                <p className="text-xs leading-relaxed text-neutral-300">
                  {data.reason}
                </p>

                {/* Evidence Chips (Max 3) */}
                {Array.isArray(data.evidence) && data.evidence.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 block mb-1.5">
                      Factual Matches
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {data.evidence.slice(0, 3).map((chip, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20"
                        >
                          <CheckCircle2 size={11} />
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subtitle / Source Note */}
                <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[10px] text-neutral-500">
                  <span>
                    Source: {data.source === 'cache' ? 'Verified Cache' : data.source === 'fallback_template' ? 'Deterministic Rule' : 'Gemini AI'}
                  </span>
                  <span className="capitalize">
                    Confidence: {data.confidence || 'medium'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
