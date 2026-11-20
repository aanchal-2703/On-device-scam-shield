import { useMemo, useState } from 'react';
import { AlertTriangle, ExternalLink, Clipboard, X } from 'lucide-react';
import type { Conversation } from '../store';
import { TACTIC_META } from '../engine/prototypes';
import { buildComplaintSummary } from '../engine/highRisk';
import { buildExplanation } from '../engine/explain';
import type { AppLanguage } from '../i18n';
import { extractPaymentDestinations } from '../engine/paymentDetails';

interface CyberFraudPopupProps {
  conversation: Conversation;
  language: AppLanguage;
  onDismiss: () => void;
}

export function CyberFraudPopup({
  conversation,
  language,
  onDismiss,
}: CyberFraudPopupProps) {
  const [showSummary, setShowSummary] = useState(false);
  const [copied, setCopied] = useState(false);

  const categories = useMemo(() => {
    const labels = conversation.risk.detectedTactics.map(
      (tactic) => TACTIC_META[tactic].label
    );
    return labels.length > 0 ? Array.from(new Set(labels)).join(', ') : 'Possible cyber fraud';
  }, [conversation.risk.detectedTactics]);

  const explanation = useMemo(
    () => buildExplanation(conversation.risk, language).narrative,
    [conversation.risk, language]
  );

  const paymentDestinations = useMemo(
    () => extractPaymentDestinations(conversation.messages),
    [conversation.messages]
  );

  const summary = useMemo(
    () =>
      buildComplaintSummary(
        conversation.risk,
        conversation.title,
        conversation.channel,
        conversation.messages
      ),
    [conversation]
  );

  const prepareOrCopy = async () => {
    setShowSummary(true);
    try {
      await navigator.clipboard?.writeText(summary);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cyber-fraud-title"
    >
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-red-200 bg-white shadow-2xl dark:border-red-900/70 dark:bg-slate-900">
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-slate-300 sm:hidden dark:bg-slate-700" />
        <div className="flex items-start gap-3 border-b border-red-100 bg-red-50 px-5 py-4 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="cyber-fraud-title" className="text-lg font-bold leading-tight text-red-700 dark:text-red-300">
              ⚠️ HIGH RISK: Possible Cyber Fraud Detected!
            </h2>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss warning"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            Our analysis indicates a high possibility of a scam. If you have already lost money, report it immediately.
          </p>

          <img
            src="/images/fraud-alert.jpg"
            alt="A smartphone showing suspicious alerts and a protective shield"
            className="mt-4 h-28 w-full rounded-xl border border-red-100 object-cover object-center dark:border-red-900/50"
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-950">
              <p className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">Current Risk Score</p>
              <p className="mt-1 font-mono text-2xl font-bold text-red-600 dark:text-red-400">
                {conversation.risk.score}/100
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-950">
              <p className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">Emergency Helpline</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">1930</p>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <p><strong className="text-slate-900 dark:text-slate-100">Detected scam category:</strong>{' '}<span className="text-slate-700 dark:text-slate-300">{categories}</span></p>
            <p><strong className="text-slate-900 dark:text-slate-100">Why flagged:</strong>{' '}<span className="text-slate-700 dark:text-slate-300">{explanation}</span></p>
          </div>

          <section
            aria-label="Payment destination details"
            className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40"
          >
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Payment destination details
            </h3>
            {paymentDestinations.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {paymentDestinations.map(({ type, value }) => (
                  <li
                    key={`${type}:${value}`}
                    className="rounded-lg border border-amber-200 bg-white px-3 py-2 dark:border-amber-900 dark:bg-slate-900"
                  >
                    <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {type}
                    </span>
                    <span className="break-all font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                      {value}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-amber-900 dark:text-amber-100">
                No account details were found in the analyzed messages or call transcript. ScamShield cannot access your bank transactions.
              </p>
            )}
            <p className="mt-2 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
              If money was already sent, check your bank or UPI app and report it to your bank and helpline 1930 immediately.
            </p>
          </section>

          {showSummary && (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Complaint summary
              </label>
              <textarea
                readOnly
                value={summary}
                rows={7}
                className="w-full resize-none rounded-lg border border-slate-300 bg-slate-50 p-3 text-xs leading-relaxed text-slate-800 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              />
              {copied && <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">Summary copied.</p>}
            </div>
          )}
        </div>

        <div className="grid gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
          <a
            href="https://cybercrime.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700"
          >
            <ExternalLink className="h-5 w-5" />
            REPORT CYBER FRAUD
          </a>
          <button
            type="button"
            onClick={prepareOrCopy}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <Clipboard className="h-4 w-4" />
            Prepare complaint summary
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-slate-300 bg-slate-100 px-4 text-sm font-bold text-slate-800 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            I&apos;m Safe / Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
