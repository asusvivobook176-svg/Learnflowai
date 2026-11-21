import React from 'react';
import { useLearner } from '../context/LearnerContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useLearner();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-5 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] pointer-events-none no-print"
    >
      {toasts.map((t) => {
        const style =
          t.type === 'success'
            ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-100'
            : t.type === 'warning'
            ? 'bg-amber-950/95 border-amber-500/50 text-amber-100'
            : t.type === 'error'
            ? 'bg-rose-950/95 border-rose-500/50 text-rose-100'
            : 'bg-slate-900/95 border-indigo-500/50 text-slate-100';

        const Icon =
          t.type === 'success'
            ? CheckCircle2
            : t.type === 'warning'
            ? AlertTriangle
            : t.type === 'error'
            ? XCircle
            : Info;

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-xl border shadow-xl backdrop-blur-md text-xs ${style}`}
          >
            <Icon className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="flex-1 leading-relaxed font-medium">{t.message}</p>
            <button
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
