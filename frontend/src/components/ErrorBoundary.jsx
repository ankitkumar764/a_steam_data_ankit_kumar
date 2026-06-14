import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
          <div className="max-w-md rounded-2xl bg-slate-900 p-8 shadow-2xl border border-red-500/20">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="mt-4 text-2xl font-bold tracking-tight">Something went wrong</h2>
            <p className="mt-2 text-slate-400">
              The application encountered an unexpected error. Don't worry, your database is safe.
            </p>
            <div className="mt-4 rounded bg-slate-950 p-3 text-left font-mono text-xs text-red-400 overflow-x-auto max-h-40">
              {this.state.error?.toString() || 'Unknown Error'}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full rounded-xl bg-cyan-600 px-4 py-2.5 font-semibold text-white transition hover:bg-cyan-500 hover:scale-[1.02] active:scale-[0.98]"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
