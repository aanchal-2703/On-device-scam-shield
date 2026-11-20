import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Square,
  Send,
  ThumbsDown,
  ThumbsUp,
  PhoneCall,
  MessageSquare,
  ChevronLeft,
  Activity,
} from 'lucide-react';
import { DEMO_CONVERSATIONS } from '../data/demo';
import type { Conversation, DemoPlaybackState } from '../store';
import { TRANSLATIONS, type AppLanguage } from '../i18n';
import { Underline } from './Underline';

interface ChatProps {
  language: AppLanguage;
  conversation: Conversation | undefined;
  demoPlayback: DemoPlaybackState;
  onPlayDemo: (conversationId: string) => void;
  onStopDemo: () => void;
  onSendMessage: (conversationId: string, text: string, sender: 'them' | 'me' | 'caller') => void;
  onMarkFeedback: (conversationId: string, messageId: string, kind: 'scam' | 'safe') => void;
  onMobileBack?: () => void;
  onMobileOpenRisk?: () => void;
}

export const Chat: React.FC<ChatProps> = ({
  language,
  conversation,
  demoPlayback,
  onPlayDemo,
  onStopDemo,
  onSendMessage,
  onMarkFeedback,
  onMobileBack,
  onMobileOpenRisk,
}) => {
  const [draft, setDraft] = useState('');
  const [senderRole, setSenderRole] = useState<'them' | 'me'>('them');
  const scrollRef = useRef<HTMLDivElement>(null);
  const tr = TRANSLATIONS[language];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages.length, conversation?.id]);

  if (!conversation) {
    return (
      <section className="flex h-full flex-col items-center justify-center p-8 text-center text-sm text-slate-500 dark:text-slate-400">
        {tr.chat.emptyHint}
      </section>
    );
  }

  const isDemoScript = DEMO_CONVERSATIONS.some((d) => d.id === conversation.id);
  const isPlayingThis =
    demoPlayback.isPlaying && demoPlayback.conversationId === conversation.id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const effectiveSender =
      senderRole === 'me'
        ? 'me'
        : conversation.channel === 'Voice Call'
          ? 'caller'
          : 'them';
    onSendMessage(conversation.id, draft, effectiveSender);
    setDraft('');
  };

  return (
    <section
      aria-label="Conversation transcript"
      className="flex h-full flex-col bg-slate-50/70 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800"
    >
      {/* Chat Header */}
      <header className="flex items-center justify-between gap-2 sm:gap-3 border-b border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {onMobileBack && (
            <button
              type="button"
              onClick={onMobileBack}
              aria-label="Back to inbox"
              className="lg:hidden -ml-1.5 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {conversation.title}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              {conversation.channel === 'Voice Call' ? (
                <PhoneCall className="w-3 h-3 shrink-0" />
              ) : (
                <MessageSquare className="w-3 h-3 shrink-0" />
              )}
              <span>{conversation.channel}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate font-mono">{conversation.handle}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isDemoScript && (
            isPlayingThis ? (
              <button
                type="button"
                onClick={onStopDemo}
                className="min-h-[40px] sm:min-h-0 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>{tr.chat.stopDemo}</span>
                <span className="font-mono tabular-nums">
                  ({demoPlayback.currentStep}/{demoPlayback.totalSteps})
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onPlayDemo(conversation.id)}
                className="min-h-[40px] sm:min-h-0 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Play className="w-3 h-3 fill-current" />
                {tr.chat.playDemo}
              </button>
            )
          )}

          {onMobileOpenRisk && (
            <button
              type="button"
              onClick={onMobileOpenRisk}
              aria-label={tr.risk.safetyCheck}
              className={`xl:hidden min-h-[40px] inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                conversation.risk.riskLevel === 'red'
                  ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-300'
                  : conversation.risk.riskLevel === 'amber'
                    ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-900/70 dark:bg-amber-950/50 dark:text-amber-300'
                    : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300'
              }`}
            >
              <Activity className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono tabular-nums">{conversation.risk.score}</span>
            </button>
          )}
        </div>
      </header>

      {/* Hint bar for Grammarly-style inspection */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 bg-white/80 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-400">
        <span>{tr.chat.hintText}</span>
        <span className="inline-flex items-center gap-3">
          <span className="underline decoration-wavy decoration-amber-500 decoration-2 underline-offset-4">
            {tr.chat.cautionLegend}
          </span>
          <span className="underline decoration-wavy decoration-red-600 decoration-2 underline-offset-4">
            {tr.chat.dangerLegend}
          </span>
        </span>
      </div>

      {/* Messages Feed */}
      <div ref={scrollRef} className="chat-canvas-grid flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {conversation.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {isPlayingThis ? tr.chat.waitingNext : tr.chat.noMessages}
            </p>
            <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
              {tr.chat.emptyHint}
            </p>
          </div>
        ) : (
          conversation.messages.map((msg) => {
            const isMine = msg.sender === 'me';

            return (
              <div
                key={msg.id}
                className={`animate-msg-in flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[78%] rounded-xl px-4 py-3 text-sm leading-relaxed border shadow-2xs ${
                    isMine
                      ? 'bg-blue-700 text-white border-blue-700 dark:bg-blue-600 dark:border-blue-600'
                      : 'bg-white text-slate-900 border-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800'
                  }`}
                >
                  {isMine ? (
                    <span>{msg.text}</span>
                  ) : (
                    <Underline text={msg.text} spans={msg.spans} language={language} />
                  )}
                </div>

                <div
                  className={`mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 ${
                    isMine ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span className="font-mono tabular-nums">{msg.timestamp}</span>
                  {!isMine && msg.tactics.length > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {msg.tactics.map((t) => tr.tactics[t].shortLabel).join(', ')}
                      </span>
                    </>
                  )}
                  {!isMine && (msg.semanticConfidence > 0 || msg.spans.length > 0) && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[10px] tabular-nums text-slate-400 dark:text-slate-500">
                        {msg.semanticConfidence > 0
                          ? `${msg.engineMode === 'minilm' ? 'MiniLM AI' : 'Offline AI'} ${msg.semanticConfidence}%`
                          : 'Rule'}
                      </span>
                    </>
                  )}
                  {!isMine && (
                    <>
                      <span aria-hidden="true">·</span>
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onMarkFeedback(conversation.id, msg.id, 'scam')}
                          className={`min-h-[32px] inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                            msg.userFeedback === 'scam'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                              : 'hover:bg-slate-200/70 text-slate-500 dark:text-slate-400 dark:hover:bg-slate-800'
                          }`}
                        >
                          <ThumbsDown className="w-3 h-3" />
                          {tr.chat.markScam}
                        </button>
                        <button
                          type="button"
                          onClick={() => onMarkFeedback(conversation.id, msg.id, 'safe')}
                          className={`min-h-[32px] inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                            msg.userFeedback === 'safe'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'hover:bg-slate-200/70 text-slate-500 dark:text-slate-400 dark:hover:bg-slate-800'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          {tr.chat.markSafe}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Composer */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-200 bg-white p-2.5 sm:p-3 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="inline-flex self-start items-center gap-1 rounded-md bg-slate-100 p-0.5 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setSenderRole('them')}
              className={`min-h-[34px] sm:min-h-0 rounded px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                senderRole === 'them'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {tr.chat.incomingTab}
            </button>
            <button
              type="button"
              onClick={() => setSenderRole('me')}
              className={`min-h-[34px] sm:min-h-0 rounded px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                senderRole === 'me'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {tr.chat.replyTab}
            </button>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            <span className="text-slate-400 dark:text-slate-500 shrink-0">{tr.chat.quickTestLabel}</span>
            <button
              type="button"
              onClick={() => {
                setSenderRole('them');
                setDraft('मैं मुंबई साइबर क्राइम पुलिस से बोल रहा हूँ, तुरंत ओटीपी बताएं नहीं तो आपका खाता बंद कर दिया जाएगा।');
              }}
              className="shrink-0 min-h-[32px] sm:min-h-0 rounded border border-slate-200 px-2.5 py-1 sm:py-0.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => {
                setSenderRole('them');
                setDraft('Main HDFC fraud desk se bol raha hoon, turant 6-digit OTP bataiye warna card block ho jayega.');
              }}
              className="shrink-0 min-h-[32px] sm:min-h-0 rounded border border-slate-200 px-2.5 py-1 sm:py-0.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
            >
              Hinglish
            </button>
            <button
              type="button"
              onClick={() => {
                setSenderRole('them');
                setDraft('నేను సైబర్ క్రైమ్ పోలీస్ మాట్లాడుతున్నాను, వెంటనే ఓటీపీ చెప్పండి లేకపోతే ఖాతా బ్లాక్ అవుతుంది.');
              }}
              className="shrink-0 min-h-[32px] sm:min-h-0 rounded border border-slate-200 px-2.5 py-1 sm:py-0.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
            >
              తెలుగు
            </button>
            <button
              type="button"
              onClick={() => {
                setSenderRole('them');
                setDraft('मी मुंबई सायबर क्राईम पोलीस बोलत आहे, तात्काळ ओटीपी सांगा अन्यथा तुमचे बँक खाते बंद होईल आणि कोणालाही सांगू नका.');
              }}
              className="shrink-0 min-h-[32px] sm:min-h-0 rounded border border-slate-200 px-2.5 py-1 sm:py-0.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
            >
              मराठी
            </button>
            <button
              type="button"
              onClick={() => {
                setSenderRole('them');
                setDraft('Share OTP 4918 ONLY with the delivery partner at your doorstep. Do not share over phone.');
              }}
              className="shrink-0 min-h-[32px] sm:min-h-0 rounded border border-slate-200 px-2.5 py-1 sm:py-0.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
            >
              {tr.inbox.filterGreen} OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setSenderRole('them');
                setDraft(
                  'Hello, your home electricity supply meter shows unpaid arrears and power will be cut tonight unless you send the temporary settlement to our field engineer right away without telling neighbors.'
                );
              }}
              className="shrink-0 min-h-[32px] sm:min-h-0 rounded border border-blue-200 bg-blue-50/70 px-2.5 py-1 sm:py-0.5 font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-950/70 cursor-pointer"
            >
              {tr.chat.unseenTestChip}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              senderRole === 'them'
                ? tr.chat.inputPlaceholderIncoming
                : tr.chat.inputPlaceholderReply
            }
            className="flex-1 min-h-[44px] rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-950"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-sm sm:text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Send className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            {tr.chat.analyzeBtn}
          </button>
        </div>
      </form>
    </section>
  );
};
