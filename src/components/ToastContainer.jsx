import React from 'react';
import { useFarm } from '../context/FarmContext';

export default function ToastContainer({ toasts: propToasts, removeToast: propRemoveToast }) {
  let toasts = propToasts;
  let removeToast = propRemoveToast;

  // If props not passed directly, consume from FarmContext
  if (!toasts || !removeToast) {
    try {
      const farm = useFarm();
      if (!toasts) toasts = farm.toasts;
      if (!removeToast) removeToast = farm.removeToast;
    } catch {
      toasts = toasts || [];
      removeToast = removeToast || (() => {});
    }
  }

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] sm:w-96 pointer-events-none"
      aria-live="polite"
      role="region"
      aria-label="Farm notifications"
    >
      {toasts.map((toast) => {
        const type = toast.type || 'info';

        let bgGradient = 'bg-slate-900/95';
        let borderColor = 'border-slate-700';
        let iconColor = 'text-sky-400';
        let iconClass = 'fa-solid fa-circle-info';
        let title = 'Notification';

        if (type === 'success') {
          bgGradient = 'bg-gradient-to-r from-[#12391b]/95 to-[#1a5327]/95';
          borderColor = 'border-emerald-500/40 shadow-emerald-950/40';
          iconColor = 'text-emerald-400';
          iconClass = 'fa-solid fa-circle-check';
          title = 'Success';
        } else if (type === 'error') {
          bgGradient = 'bg-gradient-to-r from-rose-950/95 to-red-900/95';
          borderColor = 'border-rose-500/40 shadow-rose-950/40';
          iconColor = 'text-rose-400';
          iconClass = 'fa-solid fa-circle-xmark';
          title = 'Error';
        } else if (type === 'warning') {
          bgGradient = 'bg-gradient-to-r from-amber-950/95 to-yellow-900/95';
          borderColor = 'border-amber-500/40 shadow-amber-950/40';
          iconColor = 'text-amber-400';
          iconClass = 'fa-solid fa-triangle-exclamation';
          title = 'Notice';
        }

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border ${borderColor} ${bgGradient} text-white shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0`}
            style={{
              animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 12px 30px -6px rgba(0, 0, 0, 0.45)'
            }}
          >
            <div className="shrink-0 mt-0.5">
              <i className={`${iconClass} ${iconColor} text-lg`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-white/60 mb-0.5">
                {title}
              </div>
              <div className="text-xs sm:text-sm font-medium leading-relaxed text-slate-100 break-words">
                {toast.message}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-white/40 hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-white/10"
              aria-label="Dismiss toast"
            >
              <i className="fa-solid fa-xmark text-xs" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
