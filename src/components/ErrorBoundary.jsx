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
    console.error('OceanPulse runtime error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-lg text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-heading">Application Recovery Mode</h2>
            <p className="text-xs text-slate-300">
              {this.state.error?.message || 'A transient UI exception occurred. Click below to reload the platform.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-coral py-2.5 px-5 text-xs rounded-xl inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Reload OceanPulse
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

