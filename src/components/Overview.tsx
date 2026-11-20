import React, { useCallback, useState } from 'react';
import {
  ArrowRight,
  PhoneCall,
  Play,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  PhoneOff,
  Eye,
  Mic,
} from 'lucide-react';
import { DEMO_CONVERSATIONS } from '../data/demo';
import type { Conversation } from '../store';
import { TRANSLATIONS, type AppLanguage } from '../i18n';
import { ScamSpottingOverlay } from './ScamSpottingOverlay';

interface OverviewProps {
  language: AppLanguage;
  conversations: Conversation[];
  onOpenInbox: () => void;
  onLaunchDemo: (conversationId: string) => void;
  onOpenCallMode: () => void;
}

const HERO_IMAGE = '/images/account-safety.jpg';
const STEP1_IMAGE = '/images/guide-unknown-caller.svg';
const STEP2_IMAGE = '/images/fraud-alert.jpg';
const STEP3_IMAGE = '/images/guide-stop-and-check.svg';
const CALLMODE_IMAGE = '/images/call-check-illustration.svg';

export const Overview: React.FC<OverviewProps> = ({
  language,
  conversations,
  onOpenInbox,
  onLaunchDemo,
  onOpenCallMode,
}) => {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [spottingOpen, setSpottingOpen] = useState(false);
  const handleCloseSpotting = useCallback(() => setSpottingOpen(false), []);
  const markFailed = (key: string) =>
    setFailedImages((prev) => ({ ...prev, [key]: true }));

  const tr = TRANSLATIONS[language];
  const ov = tr.overview;

  const featuredIds = [
    'demo-slow-burn',
    'demo-digital-arrest',
    'demo-kyc-sms',
    'demo-hinglish-bank',
    'demo-delivery-otp',
    'demo-bank-alert',
  ];

  const featuredScenarios = featuredIds
    .map((id) => {
      const demo = DEMO_CONVERSATIONS.find((d) => d.id === id);
      const conv = conversations.find((c) => c.id === id);
      return demo && conv ? { demo, conv } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left Editorial Column */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-5">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {ov.kicker}
                </p>

                <h1
                  className="font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.1]"
                  style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3.25rem)', textWrap: 'balance' }}
                >
                  {ov.heroTitle}
                </h1>

                <p className="max-w-xl text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                  {ov.heroBody}
                </p>

                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
                  <button
                    type="button"
                    onClick={onOpenInbox}
                    className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {ov.ctaInbox}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={onOpenCallMode}
                    className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <PhoneCall className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                    {ov.ctaCall}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSpottingOpen(true)}
                    className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-900 hover:bg-amber-100 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-950/70 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Eye className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    {ov.openSpottingGuide}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
                <Mic className="mt-0.5 h-5 w-5 shrink-0 text-blue-700 dark:text-blue-300" aria-hidden="true" />
                <div className="space-y-1">
                  <h2 className="text-sm font-bold">{ov.voiceGuideTitle}</h2>
                  <p className="text-xs leading-relaxed">{ov.voiceGuideBody}</p>
                </div>
              </div>

              {/* Simple Traffic-Light Legend for Immediate Understanding */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {ov.greenLegend}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="font-semibold text-amber-700 dark:text-amber-400">
                    {ov.amberLegend}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200">
                  <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span className="font-semibold text-red-700 dark:text-red-400">
                    {ov.redLegend}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Focal Visual */}
            <div className="lg:col-span-5">
              <div className="relative h-full min-h-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
                {!failedImages.hero ? (
                  <img
                    src={HERO_IMAGE}
                    alt={ov.heroTitle}
                    referrerPolicy="no-referrer"
                    onError={() => markFailed('hero')}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-8 text-center text-white">
                    <Shield className="w-12 h-12 text-blue-400 mb-3" />
                    <p className="text-sm font-semibold">ScamShield</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual 3-Step Story Guide (Designed for clear comprehension at a glance) */}
      <section className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14 space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                {ov.guideKicker}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {ov.guideTitle}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {ov.guideSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSpottingOpen(true)}
              className="self-start sm:self-auto min-h-[44px] inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              <Eye className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
              {ov.openSpottingGuide}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                {STEP1_IMAGE && !failedImages.step1 ? (
                  <img
                    src={STEP1_IMAGE}
                    alt={ov.step1Title}
                    referrerPolicy="no-referrer"
                    onError={() => markFailed('step1')}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <PhoneCall className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="p-5 space-y-2">
                <p className="font-mono text-xs font-semibold text-amber-700 dark:text-amber-400">
                  {ov.step1Tag}
                </p>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {ov.step1Title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {ov.step1Body}
                </p>
              </div>
            </article>

            {/* Step 2 */}
            <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                {!failedImages.step2 ? (
                  <img
                    src={STEP2_IMAGE}
                    alt={ov.step2Title}
                    referrerPolicy="no-referrer"
                    onError={() => markFailed('step2')}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="p-5 space-y-2">
                <p className="font-mono text-xs font-semibold text-red-600 dark:text-red-400">
                  {ov.step2Tag}
                </p>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {ov.step2Title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {ov.step2Body}
                </p>
              </div>
            </article>

            {/* Step 3 */}
            <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                {STEP3_IMAGE && !failedImages.step3 ? (
                  <img
                    src={STEP3_IMAGE}
                    alt={ov.step3Title}
                    referrerPolicy="no-referrer"
                    onError={() => markFailed('step3')}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <PhoneOff className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="p-5 space-y-2">
                <p className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {ov.step3Tag}
                </p>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {ov.step3Title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {ov.step3Body}
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Interactive Scenario Launcher */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {ov.scenariosTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {ov.scenariosSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenInbox}
            className="self-start sm:self-auto min-h-[36px] inline-flex items-center text-xs font-semibold text-blue-700 hover:underline dark:text-blue-400 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {ov.openAll}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredScenarios.map(({ demo, conv }, idx) => {
            const isScam = demo.category === 'scam';
            const isFirstFeatured = idx === 0;

            return (
              <div
                key={demo.id}
                className={`flex flex-col justify-between rounded-xl border bg-white p-5 transition-colors dark:bg-slate-900 ${
                  isFirstFeatured
                    ? 'border-blue-300 dark:border-blue-800/80 md:col-span-2 lg:col-span-1'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      {demo.channel} · {demo.messages.length} {tr.risk.messagesUnit}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-mono font-semibold tabular-nums ${
                        isScam
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isScam ? (
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      )}
                      {isScam ? `${ov.dangerLabel} · ${conv.risk.score}` : `${ov.safeLabel} · ${conv.risk.score}`}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {demo.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {demo.summary}
                    </p>
                  </div>

                  <p className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs italic text-slate-600 line-clamp-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                    “{demo.messages[0]?.text}”
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                    {isScam ? ov.stopHangUp : ov.normalMsg}
                  </span>
                  <button
                    type="button"
                    onClick={() => onLaunchDemo(demo.id)}
                    className="min-h-[40px] sm:min-h-0 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 sm:py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    {ov.watchExample}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Speakerphone Call Check Spotlight */}
      <section className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-4 sm:space-y-5">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                {ov.callKicker}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {ov.callTitle}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {ov.callBody}
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenCallMode}
                  className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm sm:text-xs font-semibold text-white hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  {ov.openCallMode}
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {ov.callNote}
                </span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[240px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
                {CALLMODE_IMAGE && !failedImages.callmode ? (
                  <img
                    src={CALLMODE_IMAGE}
                    alt={ov.callTitle}
                    referrerPolicy="no-referrer"
                    onError={() => markFailed('callmode')}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-900 text-white">
                    <PhoneCall className="w-10 h-10 text-blue-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 pb-8 sm:pb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
            <Shield className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <span>ScamShield</span>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={onOpenInbox} className="min-h-[36px] hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer">
              {tr.nav.inbox}
            </button>
            <button type="button" onClick={onOpenCallMode} className="min-h-[36px] hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer">
              {tr.nav.callMode}
            </button>
          </div>
          <div className="font-mono tabular-nums text-center">
            {ov.helplineFooter}
          </div>
        </div>
      </footer>

      <ScamSpottingOverlay
        open={spottingOpen}
        language={language}
        onClose={handleCloseSpotting}
        onCheckMessages={onOpenInbox}
      />
    </div>
  );
};
