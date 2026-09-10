import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('KisanKendra UI Caught Error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080d17] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-black text-white font-display">Something went wrong</h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              An unexpected error occurred while loading this view. Your session and queue data are safe in the database.
            </p>
            {this.state.error && (
              <div className="mt-4 p-3 bg-black/50 border border-emerald-500/20 rounded-xl text-[11px] font-mono text-emerald-300 text-left overflow-x-auto max-h-24">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="mt-6 w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              Reload KisanKendra Portal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

