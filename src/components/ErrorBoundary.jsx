import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AL Rehman Meta Eggs UI Error Caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.hash = '#/dashboard';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#082013] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#0d2c20] border border-[#c9f36a]/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-[#c9f36a] border border-[#c9f36a]/40 flex items-center justify-center mx-auto text-2xl">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h2 className="font-manrope font-black text-xl text-white">Interface Refresh Required</h2>
            <p className="text-xs text-white/70">
              The farm encountered an unexpected interface hiccup. Click below to refresh your flock view.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#c9f36a] via-lime-400 to-[#c9f36a] text-[#082013] font-manrope font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Reload Farm Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
