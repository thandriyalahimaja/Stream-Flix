import React from 'react';
import { Button } from './ui/Button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Standard error logging
    console.error('ErrorBoundary caught an execution crash:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center p-6 text-center select-none transition-all duration-500"
          style={{
            background: 'var(--cw-bg, #0B0709)',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <div
            className="w-full max-w-lg p-8 md:p-10 rounded-3xl border glass-strong relative overflow-hidden"
            style={{
              borderColor: 'color-mix(in srgb, var(--cw-text, #FFF) 8%, transparent)',
              boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6)',
              background: 'var(--cw-card, #130D10)',
            }}
          >
            {/* Visual gradient accent */}
            <div
              className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20"
              style={{ background: 'var(--cw-button, #E23C64)' }}
            />
            <div
              className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20"
              style={{ background: 'var(--cw-accent, #B587C6)' }}
            />

            <div className="relative z-10 space-y-6">
              {/* Animated Warning Icon */}
              <div className="flex justify-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center border border-dashed animate-pulse"
                  style={{
                    borderColor: 'var(--cw-button, #E23C64)',
                    background: 'color-mix(in srgb, var(--cw-button, #E23C64) 10%, transparent)',
                  }}
                >
                  <span className="text-3xl">⚠️</span>
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--cw-text, #FFF)' }}>
                  Something went wrong
                </h1>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--cw-text2, #9E9498)' }}>
                  A rendering conflict has interrupted the user interface. Please try reloading the session.
                </p>
              </div>

              {/* Error Detail Box */}
              {this.state.error && (
                <div
                  className="p-4 rounded-xl text-left font-mono text-xs overflow-auto max-h-36 max-w-full border select-text"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderColor: 'color-mix(in srgb, var(--cw-text, #FFF) 5%, transparent)',
                    color: 'var(--cw-button, #E23C64)',
                  }}
                >
                  {this.state.error.toString()}
                </div>
              )}

              <div className="pt-2 flex justify-center gap-3">
                <Button onClick={this.handleReload} size="lg">
                  Reload Page
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => { window.location.href = '/'; }}
                >
                  Return Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
