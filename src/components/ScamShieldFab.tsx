import React, { useState } from 'react';
import { Shield, PhoneCall, MessageSquare, Zap, X } from 'lucide-react';

interface ScamShieldFabProps {
  onCheckCall: () => void;
  onCheckMessage: () => void;
  onQuickTest: () => void;
}

export const ScamShieldFab: React.FC<ScamShieldFabProps> = ({
  onCheckCall,
  onCheckMessage,
  onQuickTest,
}) => {
  const [open, setOpen] = useState(false);

  const handleAction = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div className="fixed bottom-20 right-4 z-30 md:hidden flex flex-col items-end gap-2.5">
      {/* Expanded menu items */}
      {open && (
        <div className="flex flex-col items-end gap-2 animate-fab-menu-in">
          {/* Quick Test */}
          <button
            type="button"
            onClick={() => handleAction(onQuickTest)}
            className="flex items-center gap-2.5 rounded-full bg-white pl-3.5 pr-2 py-1.5 shadow-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 cursor-pointer"
          >
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              Quick Test
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white shrink-0">
              <Zap className="w-4 h-4" />
            </span>
          </button>

          {/* Check Message */}
          <button
            type="button"
            onClick={() => handleAction(onCheckMessage)}
            className="flex items-center gap-2.5 rounded-full bg-white pl-3.5 pr-2 py-1.5 shadow-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 cursor-pointer"
          >
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              Check Message
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0">
              <MessageSquare className="w-4 h-4" />
            </span>
          </button>

          {/* Check Call */}
          <button
            type="button"
            onClick={() => handleAction(onCheckCall)}
            className="flex items-center gap-2.5 rounded-full bg-white pl-3.5 pr-2 py-1.5 shadow-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 cursor-pointer"
          >
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              Check Call
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-white shrink-0">
              <PhoneCall className="w-4 h-4" />
            </span>
          </button>
        </div>
      )}

      {/* Backdrop when open */}
      {open && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main FAB button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'ScamShield quick actions'}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-200 cursor-pointer ${
          open
            ? 'bg-slate-800 dark:bg-slate-200 rotate-0'
            : 'bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 fab-pulse'
        }`}
      >
        {open ? (
          <X className="w-6 h-6 text-white dark:text-slate-900" />
        ) : (
          <Shield className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
};
