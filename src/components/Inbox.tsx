import React, { useState } from 'react';
import {
  Search,
  PhoneCall,
  Plus,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import type { Conversation, ModelStatus } from '../store';
import { TRANSLATIONS, type AppLanguage } from '../i18n';

interface InboxProps {
  language: AppLanguage;
  conversations: Conversation[];
  activeId: string;
  searchQuery: string;
  filterRisk: 'all' | 'green' | 'amber' | 'red';
  taggerStatus: ModelStatus;
  onSelect: (id: string) => void;
  onSearchChange: (q: string) => void;
  onFilterChange: (filter: 'all' | 'green' | 'amber' | 'red') => void;
  onNewCustom: (title: string, channel: 'SMS' | 'WhatsApp' | 'Voice Call') => void;
  onOpenCallMode: () => void;
}

export const Inbox: React.FC<InboxProps> = ({
  language,
  conversations,
  activeId,
  searchQuery,
  filterRisk,
  taggerStatus,
  onSelect,
  onSearchChange,
  onFilterChange,
  onNewCustom,
  onOpenCallMode,
}) => {
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newChannel, setNewChannel] = useState<'SMS' | 'WhatsApp' | 'Voice Call'>('SMS');
  const tr = TRANSLATIONS[language].inbox;

  const filtered = conversations.filter((c) => {
    if (filterRisk !== 'all' && c.risk.riskLevel !== filterRisk) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q);
      const matchMsg = c.messages.some((m) => m.text.toLowerCase().includes(q));
      return matchTitle || matchMsg;
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onNewCustom(newTitle || tr.newCheck, newChannel);
    setNewTitle('');
    setCreating(false);
  };

  return (
    <aside
      aria-label={tr.title}
      className="flex h-full flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800"
    >
      {/* Top Action & Search */}
      <div className="p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {tr.title}
          </h2>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCreating((v) => !v)}
              className="min-h-[40px] sm:min-h-0 inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
              title={tr.newCheck}
            >
              <Plus className="w-3.5 h-3.5" />
              {tr.newCheck}
            </button>
          </div>
        </div>

        {/* Prominent Call Mode entry */}
        <button
          type="button"
          onClick={onOpenCallMode}
          className="w-full min-h-[46px] sm:min-h-0 flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-3.5 py-2.5 sm:py-2 text-sm sm:text-xs font-semibold text-white hover:bg-blue-800 transition-colors cursor-pointer whitespace-nowrap"
        >
          <PhoneCall className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
          {tr.checkCall}
        </button>

        {creating && (
          <form
            onSubmit={handleCreate}
            className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60"
          >
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={tr.senderPlaceholder}
              className="w-full min-h-[44px] sm:min-h-0 rounded-md border border-slate-200 bg-white px-3 py-2 sm:py-1.5 text-base sm:text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            <div className="flex items-center gap-2">
              <select
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value as 'SMS' | 'WhatsApp' | 'Voice Call')}
                className="flex-1 min-h-[44px] sm:min-h-0 rounded-md border border-slate-200 bg-white px-2.5 py-2 sm:py-1.5 text-base sm:text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="SMS">SMS</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Voice Call">Voice Call</option>
              </select>
              <button
                type="submit"
                className="min-h-[44px] sm:min-h-0 rounded-md bg-slate-900 px-4 py-2 sm:py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer"
              >
                {tr.startBtn}
              </button>
            </div>
          </form>
        )}

        {/* Search input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-3.5 sm:h-3.5 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={tr.searchPlaceholder}
            aria-label={tr.searchPlaceholder}
            className="w-full min-h-[44px] sm:min-h-0 rounded-lg border border-slate-200 bg-slate-50 pl-9 sm:pl-8 pr-3 py-2 sm:py-1.5 text-base sm:text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:bg-slate-900"
          />
        </div>

        {/* Interactive segmented filter */}
        <div
          role="group"
          aria-label="Filter by risk level"
          className="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800"
        >
          {(['all', 'red', 'amber', 'green'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onFilterChange(level)}
              className={`min-h-[38px] sm:min-h-0 rounded-md py-1.5 sm:py-1 text-xs sm:text-[11px] font-medium transition-colors cursor-pointer ${
                filterRisk === level
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {level === 'all' ? tr.filterAll : level === 'red' ? tr.filterRed : level === 'amber' ? tr.filterAmber : tr.filterGreen}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
            {tr.noMatches}
          </div>
        ) : (
          filtered.map((conv) => {
            const isActive = conv.id === activeId;
            const lastMsg = conv.messages[conv.messages.length - 1];
            const risk = conv.risk;

            const RiskIcon =
              risk.riskLevel === 'red'
                ? ShieldAlert
                : risk.riskLevel === 'amber'
                  ? AlertTriangle
                  : ShieldCheck;

            const riskTextColor =
              risk.riskLevel === 'red'
                ? 'text-red-600 dark:text-red-400'
                : risk.riskLevel === 'amber'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400';

            const riskWord =
              risk.riskLevel === 'red' ? tr.filterRed : risk.riskLevel === 'amber' ? tr.filterAmber : tr.filterGreen;

            const initials = conv.title
              .split(/\s+/)
              .slice(0, 2)
              .map((w) => w[0]?.toUpperCase() ?? '')
              .join('') || 'SC';

            const avatarColor =
              risk.riskLevel === 'red'
                ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900/60'
                : risk.riskLevel === 'amber'
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/60';

            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelect(conv.id)}
                className={`w-full min-h-[68px] text-left px-4 py-3.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-blue-600 ${
                  isActive
                    ? 'bg-blue-50/60 dark:bg-slate-800/90'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    aria-hidden="true"
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold font-mono ${avatarColor}`}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {conv.title}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold font-mono tabular-nums shrink-0 ${riskTextColor}`}
                      >
                        <RiskIcon className="w-3.5 h-3.5 shrink-0" />
                        {riskWord} · {risk.score}
                      </span>
                    </div>

                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {conv.channel === 'Voice Call' ? (
                        <PhoneCall className="w-3 h-3 shrink-0" />
                      ) : (
                        <MessageSquare className="w-3 h-3 shrink-0" />
                      )}
                      <span className="truncate">{conv.channel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate font-mono">{conv.handle}</span>
                    </div>

                    <p className="mt-1 line-clamp-1 text-xs text-slate-600 dark:text-slate-300">
                      {lastMsg ? lastMsg.text : conv.summary}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* On-Device Embedding Model Readiness Bar */}
      <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-2.5 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate">{taggerStatus.statusText}</span>
          {taggerStatus.state === 'loading' && (
            <span className="font-mono tabular-nums shrink-0">{taggerStatus.progress}%</span>
          )}
        </div>
        {taggerStatus.state === 'loading' && (
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${taggerStatus.progress}%` }}
            />
          </div>
        )}
      </div>
    </aside>
  );
};
