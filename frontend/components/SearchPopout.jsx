import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, X, TrendingUp, Clock, ChevronDown, Cpu, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/constants/routes';

export const AI_MODELS = [
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', badge: 'Default', desc: 'Balanced speed & semantic retrieval' },
  { id: 'gemini-3.5-pro', name: 'Gemini 3.5 Pro', badge: 'Pro', desc: 'High intelligence complex intent reasoning' },
  { id: 'gemini-flash-lite', name: 'Gemini Flash-Lite', badge: 'Fast', desc: 'Ultra-low latency instant recommendations' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', badge: 'Smart', desc: 'Nuanced thematic catalog comprehension' },
  { id: 'gpt-4o', name: 'GPT-4o', badge: 'Popular', desc: 'Multimodal query understanding' },
  { id: 'custom-model', name: 'Custom User API Model', badge: 'Custom Key', desc: 'Executes using your personal saved API key' },
];

export const POPULAR_QUERIES = [
  'Dark psychological thrillers in space',
  'Feel good 90s coming-of-age comedies',
  'Mind-bending sci-fi with plot twists',
  'Cyberpunk action with synthwave soundtrack',
  'Indie romantic dramas set in Europe',
];

export function SearchPopout({ isOpen, onClose, initialQuery = '' }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const [query, setQuery] = useState(initialQuery);
  const [searchMode, setSearchMode] = useState('standard'); // 'standard' | 'remix'
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash');
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const stored = localStorage.getItem('recentSearches');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Focus input when popout opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle click outside model dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const saveSearchTerm = (term) => {
    if (!term.trim()) return;
    const updated = [term.trim(), ...recentSearches.filter((s) => s !== term.trim())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const executeSearch = (targetQuery = query, targetMode = searchMode, targetModel = selectedModel) => {
    const finalQuery = targetQuery.trim();
    if (!finalQuery) return;
    saveSearchTerm(finalQuery);
    onClose();
    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(finalQuery)}&mode=${targetMode}&model=${targetModel}`);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    executeSearch();
  };

  const activeModelObj = AI_MODELS.find((m) => m.id === selectedModel) || AI_MODELS[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl glass-strong border"
            style={{
              borderColor: 'color-mix(in srgb, var(--cw-text) 12%, transparent)',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)',
            }}
          >
            {/* Top Search Header */}
            <div className="p-4 md:p-6 border-b" style={{ borderColor: 'color-mix(in srgb, var(--cw-text) 10%, transparent)' }}>
              <form onSubmit={handleFormSubmit} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: searchMode === 'remix'
                      ? 'linear-gradient(135deg, var(--cw-button), var(--cw-accent))'
                      : 'color-mix(in srgb, var(--cw-text) 10%, transparent)',
                    color: searchMode === 'remix' ? 'white' : 'var(--cw-text)',
                  }}
                >
                  {searchMode === 'remix' ? <Sparkles size={20} /> : <Search size={20} />}
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    searchMode === 'remix'
                      ? 'Ask AI: "Feel good 90s space movies with synthwave score..."'
                      : 'Search by title, director, cast, or genre...'
                  }
                  className="w-full bg-transparent outline-none text-base md:text-lg font-medium"
                  style={{ color: 'var(--cw-text)' }}
                  id="popout-search-input"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 disabled:opacity-40"
                  style={{
                    background: 'var(--cw-button)',
                    color: 'white',
                  }}
                >
                  <span>Search</span>
                  <ArrowRight size={14} />
                </button>
              </form>

              {/* Mode Selection Tabs & Model Dropdown bar */}
              <div className="flex items-center justify-between flex-wrap gap-3 mt-4 pt-3 border-t" style={{ borderColor: 'color-mix(in srgb, var(--cw-text) 6%, transparent)' }}>
                {/* Search Mode Toggle */}
                <div className="flex p-1 rounded-xl gap-1" style={{ background: 'color-mix(in srgb, var(--cw-text) 8%, transparent)' }}>
                  <button
                    type="button"
                    onClick={() => setSearchMode('standard')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: searchMode === 'standard' ? 'var(--cw-card)' : 'transparent',
                      color: searchMode === 'standard' ? 'var(--cw-button)' : 'var(--cw-text2)',
                      boxShadow: searchMode === 'standard' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                    }}
                  >
                    <Search size={13} />
                    Standard Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchMode('remix')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: searchMode === 'remix' ? 'linear-gradient(135deg, var(--cw-button), var(--cw-accent))' : 'transparent',
                      color: searchMode === 'remix' ? 'white' : 'var(--cw-text2)',
                      boxShadow: searchMode === 'remix' ? '0 2px 10px color-mix(in srgb, var(--cw-button) 40%, transparent)' : 'none',
                    }}
                  >
                    <Sparkles size={13} />
                    Remix Search (AI)
                  </button>
                </div>

                {/* AI Model Selector Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all hover:bg-white/5"
                    style={{
                      background: 'var(--cw-card)',
                      color: 'var(--cw-text)',
                      borderColor: 'color-mix(in srgb, var(--cw-text) 12%, transparent)',
                    }}
                  >
                    <Cpu size={13} style={{ color: 'var(--cw-button)' }} />
                    <span>{activeModelObj.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase" style={{ background: 'color-mix(in srgb, var(--cw-button) 20%, transparent)', color: 'var(--cw-button)' }}>
                      {activeModelObj.badge}
                    </span>
                    <ChevronDown size={12} className={`transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {modelDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        className="absolute right-0 mt-2 w-64 rounded-2xl glass-strong border shadow-2xl p-2 z-50 space-y-1"
                        style={{
                          borderColor: 'color-mix(in srgb, var(--cw-text) 15%, transparent)',
                          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4)',
                        }}
                      >
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--cw-text2)' }}>
                          Select Search AI Model
                        </div>
                        {AI_MODELS.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setSelectedModel(m.id);
                              setModelDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs flex flex-col gap-0.5 transition-colors"
                            style={{
                              background: selectedModel === m.id ? 'color-mix(in srgb, var(--cw-button) 15%, transparent)' : 'transparent',
                              color: selectedModel === m.id ? 'var(--cw-button)' : 'var(--cw-text)',
                            }}
                          >
                            <div className="flex items-center justify-between font-semibold">
                              <span>{m.name}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase" style={{ background: 'color-mix(in srgb, var(--cw-text) 10%, transparent)' }}>
                                {m.badge}
                              </span>
                            </div>
                            <span className="text-[10px] leading-tight" style={{ color: 'var(--cw-text2)' }}>
                              {m.desc}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Quick Suggestions & Recent Searches body */}
            <div className="p-4 md:p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* AI Remix Highlights banner */}
              {searchMode === 'remix' && (
                <div
                  className="p-3.5 rounded-2xl border flex items-center gap-3"
                  style={{
                    background: 'color-mix(in srgb, var(--cw-button) 10%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--cw-button) 25%, transparent)',
                  }}
                >
                  <Sparkles size={18} style={{ color: 'var(--cw-button)' }} className="shrink-0" />
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--cw-text)' }}>
                    <strong>AI Remix Mode:</strong> Powered by <strong>{activeModelObj.name}</strong>. Type prompts describing feelings, storylines, or specific cinematic vibes.
                  </p>
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--cw-text2)' }}>
                    <Clock size={13} />
                    <span>Recent Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => executeSearch(s)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-transform hover:scale-105"
                        style={{
                          background: 'var(--cw-card)',
                          color: 'var(--cw-text)',
                          borderColor: 'color-mix(in srgb, var(--cw-text) 8%, transparent)',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Remix Queries */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--cw-text2)' }}>
                  <TrendingUp size={13} style={{ color: 'var(--cw-button)' }} />
                  <span>Trending AI Discovery Prompts</span>
                </div>
                <div className="space-y-1.5">
                  {POPULAR_QUERIES.map((pq) => (
                    <button
                      key={pq}
                      type="button"
                      onClick={() => executeSearch(pq, 'remix')}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all hover:translate-x-1"
                      style={{
                        background: 'color-mix(in srgb, var(--cw-text) 4%, transparent)',
                        color: 'var(--cw-text)',
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles size={12} style={{ color: 'var(--cw-button)' }} />
                        {pq}
                      </span>
                      <ArrowRight size={12} style={{ color: 'var(--cw-text2)' }} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
