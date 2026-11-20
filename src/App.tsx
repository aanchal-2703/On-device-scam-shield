import { useEffect, useRef, useState } from 'react';
import {
  Shield,
  Sun,
  Moon,
  Trash2,
  WifiOff,
  CheckCircle2,
  ChevronLeft,
  Globe,
} from 'lucide-react';
import { LANGUAGE_OPTIONS, TRANSLATIONS, type AppLanguage } from './i18n';
import { useScamShieldStore } from './store';
import { Overview } from './components/Overview';
import { Inbox } from './components/Inbox';
import { Chat } from './components/Chat';
import { RiskPanel } from './components/RiskPanel';
import { ConsentModal } from './components/ConsentModal';
import { CallMode } from './components/CallMode';
import { PWAInstallButton } from './components/PWAInstallButton';
import { useOnlineStatus } from './components/useOnlineStatus';
import { CyberFraudPopup } from './components/CyberFraudPopup';
import { isHighRiskScore } from './engine/highRisk';
import { VoiceNavigation } from './components/VoiceNavigation';
import { SafetyNotifications } from './components/SafetyNotifications';
import { AndroidProtectionSetup } from './components/AndroidProtectionSetup';
import { notifyHighRiskIncident } from './engine/safetyNotifications';
import {
  clearNativePendingContent,
  connectNativeContent,
  isNativeAndroid,
  updateNativeOverlayRisk,
} from './engine/nativeIntegration';

export default function App() {
  const {
    conversations,
    activeConversationId,
    searchQuery,
    filterRisk,
    darkMode,
    language,
    activeView,
    consentModalOpen,
    taggerStatus,
    whisperStatus,
    learnedPrototypes,
    demoPlayback,
    sessionWipedAt,
    initWorkers,
    setActiveConversation,
    setSearchQuery,
    setFilterRisk,
    toggleDarkMode,
    setLanguage,
    setActiveView,
    openCallConsent,
    closeCallConsent,
    grantCallConsent,
    setWhisperStatus,
    registerAudioCleanup,
    playDemo,
    stopDemo,
    sendMessage,
    createCustomCheck,
    ensureLiveCallConversation,
    markMessageFeedback,
    teachUnseenPattern,
    wipe,
  } = useScamShieldStore();

  const tr = TRANSLATIONS[language];

  const isOnline = useOnlineStatus();
  const [mobilePane, setMobilePane] = useState<'inbox' | 'chat' | 'risk'>('inbox');
  const [showWipeBanner, setShowWipeBanner] = useState(false);
  const [popupConversationId, setPopupConversationId] = useState<string | null>(null);
  const triggeredIncidents = useState(() => new Map<string, boolean>())[0];
  const previousScores = useState(() => new Map<string, number>())[0];
  const hasInitializedRiskScores = useRef(false);
  const nativeConversationIds = useRef(new Set<string>());
  const nativeConversationByPackage = useRef(new Map<string, string>());
  const processedNativeEventIds = useRef(new Set<string>());

  useEffect(() => {
    if (!hasInitializedRiskScores.current) {
      for (const conversation of conversations) {
        previousScores.set(conversation.id, conversation.risk.score);
      }
      hasInitializedRiskScores.current = true;
      return;
    }

    for (const conversation of conversations) {
      const previousScore = previousScores.get(conversation.id) ?? 0;
      const currentHighRisk = isHighRiskScore(conversation.risk.score);

      if (!currentHighRisk) {
        triggeredIncidents.delete(conversation.id);
        if (popupConversationId === conversation.id) {
          setPopupConversationId(null);
        }
      } else if (
        previousScore < 80 &&
        !triggeredIncidents.get(conversation.id)
      ) {
        triggeredIncidents.set(conversation.id, true);
        setPopupConversationId(conversation.id);
        void notifyHighRiskIncident(conversation.id).catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'High-risk notification could not be shown.';
          window.dispatchEvent(
            new CustomEvent('scamshield-notification-error', { detail: message })
          );
        });
      }

      previousScores.set(conversation.id, conversation.risk.score);
    }

    const newestNativeConversation = conversations.find((conversation) =>
      nativeConversationIds.current.has(conversation.id)
    );
    if (newestNativeConversation) {
      void updateNativeOverlayRisk(newestNativeConversation.risk.score).catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'The ScamShield overlay could not be updated.';
        window.dispatchEvent(
          new CustomEvent('scamshield-native-error', { detail: message })
        );
      });
    }
  }, [conversations, popupConversationId, previousScores, triggeredIncidents]);

  useEffect(() => {
    if (!isNativeAndroid) return;

    let disposed = false;
    let removeListener = () => {};
    const processContent = (event: {
      eventId: string;
      packageName: string;
      appLabel: string;
      source: 'notification' | 'screen' | 'share';
      text: string;
    }) => {
      if (!event.text.trim() || processedNativeEventIds.current.has(event.eventId)) return;
      processedNativeEventIds.current.add(event.eventId);
      if (processedNativeEventIds.current.size > 300) {
        const oldest = processedNativeEventIds.current.values().next().value;
        if (oldest) processedNativeEventIds.current.delete(oldest);
      }

      const state = useScamShieldStore.getState();
      const packageKey = event.packageName || event.appLabel;
      let conversationId = nativeConversationByPackage.current.get(packageKey);
      if (!conversationId || !state.conversations.some((item) => item.id === conversationId)) {
        const normalizedPackage = packageKey.toLowerCase();
        const channel =
          normalizedPackage.includes('whatsapp')
            ? 'WhatsApp'
            : normalizedPackage.includes('messaging') || normalizedPackage.includes('sms')
              ? 'SMS'
              : 'Other App';
        conversationId = state.createCustomCheck(
          event.appLabel || 'Other app',
          channel
        );
        nativeConversationByPackage.current.set(packageKey, conversationId);
        nativeConversationIds.current.add(conversationId);
      }

      const current = useScamShieldStore.getState();
      if (event.source === 'share' && current.activeView !== 'call') {
        current.setActiveConversation(conversationId);
        current.setActiveView('inbox');
      }
      current.sendMessage(
        conversationId,
        event.text,
        'them',
        `native-${event.eventId}`
      );
    };

    void connectNativeContent(processContent)
      .then((cleanup) => {
        if (disposed) cleanup();
        else removeListener = cleanup;
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Cross-app monitoring could not start.';
        window.dispatchEvent(
          new CustomEvent('scamshield-native-error', { detail: message })
        );
      });

    return () => {
      disposed = true;
      removeListener();
    };
  }, []);

  useEffect(() => {
    if (!sessionWipedAt || !isNativeAndroid) return;
    void clearNativePendingContent().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Captured content could not be cleared.';
      window.dispatchEvent(
        new CustomEvent('scamshield-native-error', { detail: message })
      );
    });
    nativeConversationByPackage.current.clear();
    nativeConversationIds.current.clear();
    processedNativeEventIds.current.clear();
  }, [sessionWipedAt]);

  const popupConversation = popupConversationId
    ? conversations.find((conversation) => conversation.id === popupConversationId)
    : undefined;

  useEffect(() => {
    initWorkers();
  }, [initWorkers]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!sessionWipedAt) return;
    setShowWipeBanner(true);
    const timer = setTimeout(() => setShowWipeBanner(false), 4500);
    return () => clearTimeout(timer);
  }, [sessionWipedAt]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    setMobilePane('chat');
  };

  const handleVoiceNavigate = (view: 'overview' | 'inbox' | 'call') => {
    if (view === 'inbox') setMobilePane('inbox');
    setActiveView(view);
  };

  return (
    <div className="flex h-dvh flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-hidden">
      {/* Top Navigation Bar (compact on phones, full 3-zone on md+) */}
      <header className="flex h-12 md:h-14 pt-safe shrink-0 items-center justify-between gap-2 sm:gap-8 border-b border-slate-200 bg-white px-3 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
        {/* Zone 1: Brand wordmark */}
        <button
          type="button"
          onClick={() => setActiveView('overview')}
          className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
        >
          <Shield className="w-5 h-5 text-blue-700 dark:text-blue-400 shrink-0" />
          <span>ScamShield</span>
        </button>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium"
        >
          <button
            type="button"
            onClick={() => setActiveView('overview')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'overview'
                ? 'border-blue-700 text-slate-900 dark:border-blue-400 dark:text-white'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tr.nav.overview}
          </button>
          <button
            type="button"
            onClick={() => setActiveView('inbox')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'inbox'
                ? 'border-blue-700 text-slate-900 dark:border-blue-400 dark:text-white'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tr.nav.inbox}
          </button>
          <button
            type="button"
            onClick={openCallConsent}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'call'
                ? 'border-blue-700 text-slate-900 dark:border-blue-400 dark:text-white'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tr.nav.callMode}
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="relative flex items-center">
            <Globe className="pointer-events-none absolute left-2 w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <select
              aria-label="Interface and analysis language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              className="min-h-[38px] rounded-lg border border-slate-200 bg-white pl-7 pr-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.shortLabel}
                </option>
              ))}
            </select>
          </div>

          <PWAInstallButton />
          <SafetyNotifications language={language} />

          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={wipe}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-red-600 dark:hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{tr.nav.wipe}</span>
            <span className="sm:hidden">{tr.nav.wipeShort}</span>
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 min-h-0 overflow-hidden relative">
        {activeView === 'overview' && (
          <Overview
            language={language}
            onOpenInbox={() => {
              setMobilePane('inbox');
              setActiveView('inbox');
            }}
            onOpenCallMode={openCallConsent}
          />
        )}

        {activeView === 'inbox' && (
          <div className="grid h-full grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[310px_1fr_370px] overflow-hidden">
            {/* Column 1: Inbox */}
            <div
              className={`h-full min-h-0 overflow-hidden ${
                mobilePane === 'inbox' ? 'block' : 'hidden lg:block'
              }`}
            >
              <Inbox
                language={language}
                conversations={conversations}
                activeId={activeConversationId}
                searchQuery={searchQuery}
                filterRisk={filterRisk}
                taggerStatus={taggerStatus}
                onSelect={handleSelectConversation}
                onSearchChange={setSearchQuery}
                onFilterChange={setFilterRisk}
                onNewCustom={(title, channel) => {
                  createCustomCheck(title, channel);
                  setMobilePane('chat');
                }}
                onOpenCallMode={openCallConsent}
              />
            </div>

            {/* Column 2: Chat Transcript with Inline Underlines */}
            <div
              className={`h-full min-h-0 overflow-hidden ${
                mobilePane === 'chat' ? 'block' : 'hidden lg:block'
              }`}
            >
              <Chat
                language={language}
                conversation={activeConversation}
                demoPlayback={demoPlayback}
                onPlayDemo={playDemo}
                onStopDemo={stopDemo}
                onSendMessage={(convId, text, sender) => sendMessage(convId, text, sender)}
                onMarkFeedback={markMessageFeedback}
                onMobileBack={() => setMobilePane('inbox')}
                onMobileOpenRisk={() => setMobilePane('risk')}
              />
            </div>

            {/* Column 3: Risk Meter, Timeline & Actions */}
            <div
              className={`flex flex-col h-full min-h-0 overflow-hidden ${
                mobilePane === 'risk' ? 'flex' : 'hidden xl:flex'
              }`}
            >
              {mobilePane === 'risk' && (
                <div className="xl:hidden flex min-h-[48px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setMobilePane('chat')}
                    className="inline-flex min-h-[44px] items-center gap-1 rounded-lg px-2 text-xs font-semibold text-blue-700 hover:bg-slate-100 dark:text-blue-400 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{activeConversation?.title ?? tr.nav.inbox}</span>
                  </button>
                  <span className="pr-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {tr.risk.safetyCheck}
                  </span>
                </div>
              )}
              <div className="flex-1 min-h-0 overflow-hidden">
                <RiskPanel
                  language={language}
                  conversation={activeConversation}
                  learnedCount={learnedPrototypes.length}
                  learnedPrototypes={learnedPrototypes}
                  onTeachPattern={teachUnseenPattern}
                />
              </div>
            </div>
          </div>
        )}

        {activeView === 'call' && (
          <CallMode
            language={language}
            whisperStatus={whisperStatus}
            setWhisperStatus={setWhisperStatus}
            ensureLiveCallConversation={ensureLiveCallConversation}
            conversations={conversations}
            learnedCount={learnedPrototypes.length}
            learnedPrototypes={learnedPrototypes}
            onTeachPattern={teachUnseenPattern}
            onTranscriptChunk={(convId, text) => sendMessage(convId, text, 'caller')}
            registerAudioCleanup={registerAudioCleanup}
          />
        )}

        {/* Session Wipe Confirmation Toast */}
        {showWipeBanner && (
          <div
            role="status"
            className="fixed bottom-20 md:bottom-4 right-4 z-40 flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 shadow-lg dark:border-emerald-900/60 dark:bg-slate-900 dark:text-slate-100"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{tr.nav.wipedToast}</span>
          </div>
        )}

        {/* Offline Mode Indicator */}
        {!isOnline && (
          <div
            role="status"
            className="fixed bottom-20 md:bottom-4 left-4 z-40 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-900 shadow-lg dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
          >
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span>{tr.nav.offlineToast}</span>
          </div>
        )}
      </main>

      {/* Call Mode Consent Gate */}
      <ConsentModal
        language={language}
        open={consentModalOpen}
        onAccept={grantCallConsent}
        onCancel={closeCallConsent}
      />

      {popupConversation && (
        <CyberFraudPopup
          conversation={popupConversation}
          language={language}
          onDismiss={() => setPopupConversationId(null)}
        />
      )}

      <VoiceNavigation
        language={language}
        activeView={activeView}
        onNavigate={handleVoiceNavigate}
        onOpenCallConsent={openCallConsent}
      />
      <AndroidProtectionSetup language={language} />
    </div>
  );
}
