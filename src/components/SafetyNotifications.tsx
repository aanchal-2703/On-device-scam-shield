import { useEffect, useRef, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import type { AppLanguage } from '../i18n';
import {
  disableSafetyNotifications,
  enableSafetyNotifications,
  getSafetyNotificationSettings,
  SAFETY_REMINDER_INTERVAL_MS,
  sendDueSafetyReminder,
  type SafetyNotificationSettings,
} from '../engine/safetyNotifications';

interface SafetyNotificationsProps {
  language: AppLanguage;
}

const LABELS: Record<
  AppLanguage,
  { button: string; enabled: string; disabled: string; enableError: string; stopError: string }
> = {
  en: {
    button: '2-hour safety alerts',
    enabled: 'Safety tips every 2 hours and high-risk alerts are on.',
    disabled: 'Safety alerts are off.',
    enableError: 'Could not enable notifications.',
    stopError: 'Could not turn notifications off.',
  },
  hi: {
    button: 'हर 2 घंटे सुरक्षा सूचना',
    enabled: 'हर 2 घंटे सुरक्षा सुझाव और खतरे की सूचनाएँ चालू हैं।',
    disabled: 'सुरक्षा सूचनाएँ बंद हैं।',
    enableError: 'सूचनाएँ चालू नहीं हो सकीं।',
    stopError: 'सूचनाएँ बंद नहीं हो सकीं।',
  },
  hinglish: {
    button: '2-hour safety alerts',
    enabled: 'Har 2 ghante safety tips aur high-risk alerts chalu hain.',
    disabled: 'Safety alerts band hain.',
    enableError: 'Notifications chalu nahi ho sake.',
    stopError: 'Notifications band nahi ho sake.',
  },
  te: {
    button: 'ప్రతి 2 గంటలకు భద్రతా సూచనలు',
    enabled: 'ప్రతి 2 గంటలకు భద్రతా సూచనలు, అధిక ప్రమాద హెచ్చరికలు ఆన్‌లో ఉన్నాయి.',
    disabled: 'భద్రతా సూచనలు ఆఫ్‌లో ఉన్నాయి.',
    enableError: 'నోటిఫికేషన్‌లు ప్రారంభం కాలేదు.',
    stopError: 'నోటిఫికేషన్‌లు ఆఫ్ కాలేదు.',
  },
  mr: {
    button: 'दर 2 तासांनी सुरक्षा सूचना',
    enabled: 'दर 2 तासांनी सुरक्षा सूचना आणि उच्च-धोका इशारे सुरू आहेत.',
    disabled: 'सुरक्षा सूचना बंद आहेत.',
    enableError: 'सूचना सुरू करता आल्या नाहीत.',
    stopError: 'सूचना बंद करता आल्या नाहीत.',
  },
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function SafetyNotifications({ language }: SafetyNotificationsProps) {
  const [settings, setSettings] = useState<SafetyNotificationSettings | null>(
    () => getSafetyNotificationSettings()
  );
  const [status, setStatus] = useState('');
  const mountedRef = useRef(true);
  const labels = LABELS[language];

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!settings?.enabled || typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      return;
    }

    let active = true;
    void enableSafetyNotifications(language)
      .then((result) => {
        if (!active) return;
        setSettings(result.settings);
        setStatus(result.message);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setStatus(getErrorMessage(error, labels.enableError));
      });

    return () => {
      active = false;
    };
  }, [language]);

  useEffect(() => {
    if (!settings?.enabled || settings.background) return;

    const remaining = Math.max(
      0,
      SAFETY_REMINDER_INTERVAL_MS - (Date.now() - settings.lastReminderAt)
    );
    const timer = window.setTimeout(() => {
      void sendDueSafetyReminder()
        .then((sent) => {
          if (!mountedRef.current) return;
          if (sent) {
            setSettings(getSafetyNotificationSettings());
            setStatus(labels.enabled);
          }
        })
        .catch((error: unknown) => {
          if (mountedRef.current) setStatus(getErrorMessage(error, labels.enableError));
        });
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [settings, labels]);

  useEffect(() => {
    const handleNotificationError = (event: Event) => {
      const message = (event as CustomEvent<string>).detail;
      if (message) setStatus(message);
    };
    window.addEventListener('scamshield-notification-error', handleNotificationError);
    return () => window.removeEventListener('scamshield-notification-error', handleNotificationError);
  }, []);

  const toggleNotifications = async () => {
    if (settings?.enabled) {
      try {
        await disableSafetyNotifications();
        setSettings(getSafetyNotificationSettings());
        setStatus(labels.disabled);
      } catch (error) {
        setStatus(getErrorMessage(error, labels.stopError));
      }
      return;
    }

    try {
      const result = await enableSafetyNotifications(language);
      setSettings(result.settings);
      setStatus(result.message);
    } catch (error) {
      setStatus(getErrorMessage(error, labels.enableError));
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleNotifications}
        aria-label={labels.button}
        aria-pressed={settings?.enabled ?? false}
        title={labels.button}
        className={`inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors cursor-pointer ${
          settings?.enabled
            ? 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        }`}
      >
        {settings?.enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        <span className="text-[11px] sm:hidden">2h</span>
        <span className="hidden sm:inline">{labels.button}</span>
      </button>
      {status && (
        <p
          role="status"
          className="absolute right-0 top-full z-[80] mt-2 w-72 rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          {status}
        </p>
      )}
    </div>
  );
}
