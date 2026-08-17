import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { X, CheckCircle2, Award, Sparkles, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useDashboard();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isLevelUp = toast.type === 'levelup';
        const isMentor = toast.type === 'mentor';
        const isSubmit = toast.type === 'submit';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-300 flex items-start gap-3 ${
              isLevelUp
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-amber-300 ring-2 ring-amber-200'
                : isMentor
                ? 'bg-slate-900 text-white border-amber-400/50'
                : isSubmit
                ? 'bg-slate-900 text-white border-slate-700'
                : 'bg-white text-slate-900 border-slate-200'
            }`}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {isLevelUp ? (
                <Sparkles className="w-5 h-5 text-yellow-200 animate-spin" />
              ) : isMentor ? (
                <Award className="w-5 h-5 text-amber-400" />
              ) : isSubmit ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Info className="w-5 h-5 text-blue-500" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-xs sm:text-sm tracking-tight leading-snug">
                {toast.title}
              </h5>
              <p
                className={`text-xs mt-0.5 leading-relaxed ${
                  isLevelUp
                    ? 'text-amber-100'
                    : isMentor || isSubmit
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }`}
              >
                {toast.description}
              </p>
            </div>

            {/* Close */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md shrink-0 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
