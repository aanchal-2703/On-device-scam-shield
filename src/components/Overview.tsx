import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  PhoneCall,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  PhoneOff,
  Eye,
  Mic,
  Volume2,
  Square,
  HeartHandshake,
} from 'lucide-react';
import { TRANSLATIONS, type AppLanguage } from '../i18n';
import { ScamSpottingOverlay } from './ScamSpottingOverlay';
import { isSpeechSynthesisSupported, speakExplanation, stopSpeaking } from '../engine/speechTts';

interface OverviewProps {
  language: AppLanguage;
  onOpenInbox: () => void;
  onOpenCallMode: () => void;
}

const HERO_IMAGE = '/images/account-safety.jpg';
const STEP1_IMAGE = '/images/guide-unknown-caller.svg';
const STEP2_IMAGE = '/images/fraud-alert.jpg';
const STEP3_IMAGE = '/images/guide-stop-and-check.svg';

export const Overview: React.FC<OverviewProps> = ({
  language,
  onOpenInbox,
  onOpenCallMode,
}) => {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [spottingOpen, setSpottingOpen] = useState(false);
  const [readingExtraHelp, setReadingExtraHelp] = useState(false);
  const handleCloseSpotting = useCallback(() => setSpottingOpen(false), []);
  const markFailed = (key: string) =>
    setFailedImages((prev) => ({ ...prev, [key]: true }));

  const tr = TRANSLATIONS[language];
  const ov = tr.overview;
  const speechSupported = isSpeechSynthesisSupported();

  useEffect(() => {
    setReadingExtraHelp(false);
    return () => stopSpeaking();
  }, [language]);

  const toggleExtraHelpSpeech = () => {
    if (readingExtraHelp) {
      stopSpeaking();
      setReadingExtraHelp(false);
      return;
    }

    const text = [
      ov.extraHelpTitle,
      ov.extraHelpBody,
      ov.step1Title,
      ov.step1Body,
      ov.step2Title,
      ov.step2Body,
      ov.step3Title,
      ov.step3Body,
    ].join('. ');
    const started = speakExplanation(text, language, {
      onStart: () => setReadingExtraHelp(true),
      onEnd: () => setReadingExtraHelp(false),
      onError: () => setReadingExtraHelp(false),
    });
    if (started) setReadingExtraHelp(true);
  };

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

      <section className="border-b border-slate-200 bg-blue-50 dark:border-slate-800 dark:bg-blue-950/30">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm dark:border-blue-900 dark:bg-slate-900 sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                <HeartHandshake className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {ov.extraHelpTitle}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {ov.extraHelpBody}
                </p>
                <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-blue-950 dark:text-blue-100">
                  {ov.step3Body}
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={toggleExtraHelpSpeech}
                      aria-pressed={readingExtraHelp}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-3 text-sm font-semibold text-blue-900 hover:bg-blue-100 dark:border-blue-800 dark:bg-slate-950 dark:text-blue-100 dark:hover:bg-blue-950"
                    >
                      {readingExtraHelp ? (
                        <Square className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Volume2 className="h-5 w-5" aria-hidden="true" />
                      )}
                      {readingExtraHelp ? ov.extraHelpStop : ov.extraHelpRead}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onOpenInbox}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"
                  >
                    <Shield className="h-5 w-5" aria-hidden="true" />
                    {ov.extraHelpCheck}
                  </button>
                  <a
                    href="tel:1930"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-900 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-950/70"
                  >
                    <PhoneCall className="h-5 w-5" aria-hidden="true" />
                    {ov.extraHelpCall}
                  </a>
                  <a
                    href="https://cybercrime.gov.in/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    {ov.extraHelpReport}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
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
