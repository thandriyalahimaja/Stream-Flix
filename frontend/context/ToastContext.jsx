import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside a ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onClose }) {
  const { type, message } = toast;

  const styles = {
    success: {
      border: '1px solid rgba(16, 185, 129, 0.2)',
      bg: 'rgba(6, 95, 70, 0.95)',
      color: '#ecfdf5',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    },
    error: {
      border: '1px solid rgba(239, 68, 68, 0.2)',
      bg: 'rgba(153, 27, 27, 0.95)',
      color: '#fef2f2',
      icon: <XCircle className="w-5 h-5 text-red-400 shrink-0" />,
    },
    warning: {
      border: '1px solid rgba(245, 158, 11, 0.2)',
      bg: 'rgba(146, 64, 14, 0.95)',
      color: '#fffbeb',
      icon: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
    },
    info: {
      border: '1px solid rgba(59, 130, 246, 0.2)',
      bg: 'rgba(30, 58, 138, 0.95)',
      color: '#eff6ff',
      icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
    },
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
      className="pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl shadow-lg backdrop-blur-md"
      style={{
        background: currentStyle.bg,
        border: currentStyle.border,
        color: currentStyle.color,
      }}
    >
      <div className="flex items-center gap-3">
        {currentStyle.icon}
        <span className="text-sm font-medium leading-tight">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/10 rounded transition-colors"
        style={{ color: 'inherit', opacity: 0.7 }}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
