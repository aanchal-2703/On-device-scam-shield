import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Upload,
  FileAudio,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { TacticId } from '../engine/prototypes';
import type { LearnedPrototype } from '../engine/tagger';
import type { Conversation, ModelStatus } from '../store';
import { TRANSLATIONS, type AppLanguage } from '../i18n';
import { Underline } from './Underline';
import { RiskPanel } from './RiskPanel';

interface CallModeProps {
  language: AppLanguage;
  whisperStatus: ModelStatus;
  setWhisperStatus: (status: Partial<ModelStatus>) => void;
  ensureLiveCallConversation: () => string;
  conversations: Conversation[];
  learnedCount: number;
  learnedPrototypes?: LearnedPrototype[];
  onTeachPattern?: (text: string, kind: 'scam' | 'safe', tactic?: TacticId) => void | Promise<void>;
  onTranscriptChunk: (conversationId: string, text: string) => void;
  registerAudioCleanup: (fn: (() => void) | null) => void;
}

interface PendingTranscription {
  resolve: (text: string) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

const TARGET_SAMPLE_RATE = 16000;
const CHUNK_SECONDS = 5;
const CHUNK_SAMPLES = TARGET_SAMPLE_RATE * CHUNK_SECONDS;

function resampleTo16kMono(audioBuffer: AudioBuffer): Float32Array {
  const numChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const mono = new Float32Array(length);

  for (let ch = 0; ch < numChannels; ch++) {
    const channelData = audioBuffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      mono[i] += channelData[i] / numChannels;
    }
  }

  if (audioBuffer.sampleRate === TARGET_SAMPLE_RATE) {
    return mono;
  }

  const ratio = audioBuffer.sampleRate / TARGET_SAMPLE_RATE;
  const newLength = Math.round(length / ratio);
  const resampled = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const srcIdx = i * ratio;
    const idx0 = Math.floor(srcIdx);
    const idx1 = Math.min(idx0 + 1, length - 1);
    const frac = srcIdx - idx0;
    resampled[i] = mono[idx0] * (1 - frac) + mono[idx1] * frac;
  }
  return resampled;
}

function downsampleBuffer(
  buffer: Float32Array,
  inputSampleRate: number,
  outputSampleRate: number
): Float32Array {
  if (inputSampleRate === outputSampleRate) return buffer;
  const ratio = inputSampleRate / outputSampleRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(Math.floor((i + 1) * ratio), buffer.length);
    let sum = 0;
    let count = 0;
    for (let j = start; j < end; j++) {
      sum += buffer[j];
      count++;
    }
    result[i] = count > 0 ? sum / count : 0;
  }
  return result;
}

export const CallMode: React.FC<CallModeProps> = ({
  language: uiLanguage,
  whisperStatus,
  setWhisperStatus,
  ensureLiveCallConversation,
  conversations,
  learnedCount,
  learnedPrototypes = [],
  onTeachPattern,
  onTranscriptChunk,
  registerAudioCleanup,
}) => {
  // File upload path is primary/first, live mic is secondary tab
  const [mode, setMode] = useState<'upload' | 'mic'>('upload');
  const [mobileTab, setMobileTab] = useState<'transcript' | 'risk'>('transcript');
  const [speechLanguage, setSpeechLanguage] = useState<'auto' | 'en' | 'hi' | 'te' | 'mr'>('auto');
  const tr = TRANSLATIONS[uiLanguage];
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileProgress, setFileProgress] = useState<{ current: number; total: number } | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [micChunksProcessed, setMicChunksProcessed] = useState(0);

  const workerRef = useRef<Worker | null>(null);
  const pendingResolvers = useRef<Map<string, PendingTranscription>>(new Map());
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const silentGainRef = useRef<GainNode | null>(null);
  const pcmBufferRef = useRef<Float32Array[]>([]);
  const pcmSampleCountRef = useRef<number>(0);
  const fileAbortRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const callConversation = conversations.find((c) => c.id === 'live-call-session');
  const callScore = callConversation?.risk.score ?? 0;
  const callRiskLevel = callConversation?.risk.riskLevel ?? 'green';

  useEffect(() => {
    ensureLiveCallConversation();
  }, [ensureLiveCallConversation]);

  const getOrCreateWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;
    const worker = new Worker(new URL('../workers/whisper.worker.ts', import.meta.url), {
      type: 'module',
    });

    setWhisperStatus({
      state: 'loading',
      progress: 5,
      statusText: 'Starting Whisper-tiny speech worker...',
    });

    worker.onmessage = (event: MessageEvent) => {
      const msg = event.data;
      if (msg.type === 'progress') {
        setWhisperStatus({
          state: 'loading',
          progress: msg.progress,
          statusText: msg.status,
        });
      } else if (msg.type === 'ready') {
        setWhisperStatus({
          state: 'ready',
          progress: 100,
          statusText: 'Whisper-tiny ready (multilingual, on-device)',
        });
      } else if (msg.type === 'error') {
        const pending = msg.requestId
          ? pendingResolvers.current.get(msg.requestId)
          : undefined;
        if (pending && msg.requestId) {
          clearTimeout(pending.timeout);
          pendingResolvers.current.delete(msg.requestId);
          pending.reject(new Error(msg.error || 'Speech transcription failed'));
        }
        setWhisperStatus({
          state: 'error',
          statusText: msg.error || 'Whisper worker error',
        });
        setErrorBanner(msg.error || 'Failed to run on-device speech model.');
      } else if (msg.type === 'transcript') {
        const pending = pendingResolvers.current.get(msg.requestId);
        if (pending) {
          clearTimeout(pending.timeout);
          pendingResolvers.current.delete(msg.requestId);
          pending.resolve(msg.text || '');
        }
      }
    };

    worker.onerror = (event) => {
      const error = new Error(event.message || 'Speech worker stopped unexpectedly');
      for (const [requestId, pending] of pendingResolvers.current) {
        clearTimeout(pending.timeout);
        pending.reject(error);
        pendingResolvers.current.delete(requestId);
      }
      setWhisperStatus({ state: 'error', statusText: error.message });
      setErrorBanner(error.message);
    };

    worker.postMessage({ type: 'init' });
    workerRef.current = worker;
    return worker;
  }, [setWhisperStatus]);

  useEffect(() => {
    getOrCreateWorker();
  }, [getOrCreateWorker]);

  const transcribeChunk = useCallback(
    (audioChunk: Float32Array): Promise<string> => {
      const worker = getOrCreateWorker();
      const requestId = `asr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          pendingResolvers.current.delete(requestId);
          reject(new Error('Speech transcription timed out. Check that the model is ready and try again.'));
        }, 120_000);
        pendingResolvers.current.set(requestId, { resolve, reject, timeout });
        try {
          worker.postMessage(
            {
              type: 'transcribe',
              requestId,
              audio: audioChunk,
              language: speechLanguage,
            },
            [audioChunk.buffer]
          );
        } catch (error) {
          clearTimeout(timeout);
          pendingResolvers.current.delete(requestId);
          reject(error instanceof Error ? error : new Error('Could not send audio to the speech worker'));
        }
      });
    },
    [getOrCreateWorker, speechLanguage]
  );

  const stopMicAndClearBuffers = useCallback(() => {
    fileAbortRef.current = true;
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (silentGainRef.current) {
      silentGainRef.current.disconnect();
      silentGainRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    pcmBufferRef.current = [];
    pcmSampleCountRef.current = 0;
    setIsRecording(false);
    setIsProcessingFile(false);
    setFileProgress(null);
    setSelectedFileName(null);
    setMicChunksProcessed(0);
  }, []);

  useEffect(() => {
    registerAudioCleanup(stopMicAndClearBuffers);
    return () => {
      stopMicAndClearBuffers();
      registerAudioCleanup(null);
    };
  }, [registerAudioCleanup, stopMicAndClearBuffers]);

  // 1. File Upload Path (Built First)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorBanner(null);
    setSelectedFileName(file.name);
    setIsProcessingFile(true);
    fileAbortRef.current = false;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      const pcm16k = resampleTo16kMono(decoded);
      await ctx.close();

      const totalChunks = Math.max(1, Math.ceil(pcm16k.length / CHUNK_SAMPLES));
      setFileProgress({ current: 0, total: totalChunks });

      const convId = ensureLiveCallConversation();

      for (let i = 0; i < totalChunks; i++) {
        if (fileAbortRef.current) break;
        const start = i * CHUNK_SAMPLES;
        const end = Math.min(start + CHUNK_SAMPLES, pcm16k.length);
        // Copy slice so transfer doesn't detach original
        const chunk = pcm16k.slice(start, end);
        const text = await transcribeChunk(chunk);
        setFileProgress({ current: i + 1, total: totalChunks });

        if (text && text.trim().length > 1 && !/^\s*\[.*\]\s*$/.test(text)) {
          onTranscriptChunk(convId, text.trim());
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to decode audio file';
      setErrorBanner(`Could not decode "${file.name}": ${msg}. Try WAV, MP3, M4A, or WebM.`);
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 2. Live Mic Path (with automatic fallback to upload if mic fails)
  const startLiveMic = async () => {
    setErrorBanner(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorBanner(
        'Live microphone capture is not supported in this browser. Switched to call recording upload.'
      );
      setMode('upload');
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      await ctx.resume();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      if (audioCtxRef.current !== ctx) {
        for (const track of stream.getTracks()) track.stop();
        return;
      }
      streamRef.current = stream;

      await ctx.resume();
      if (ctx.state !== 'running') {
        throw new Error('Audio capture could not start. Check browser microphone permissions and try again.');
      }

      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      const silentGain = ctx.createGain();
      silentGain.gain.value = 0;
      processorRef.current = processor;
      silentGainRef.current = silentGain;

      pcmBufferRef.current = [];
      pcmSampleCountRef.current = 0;
      const convId = ensureLiveCallConversation();

      processor.onaudioprocess = (ev) => {
        const input = ev.inputBuffer.getChannelData(0);
        const downsampled = downsampleBuffer(input, ctx.sampleRate, TARGET_SAMPLE_RATE);
        pcmBufferRef.current.push(downsampled);
        pcmSampleCountRef.current += downsampled.length;

        if (pcmSampleCountRef.current >= CHUNK_SAMPLES) {
          const merged = new Float32Array(pcmSampleCountRef.current);
          let offset = 0;
          for (const part of pcmBufferRef.current) {
            merged.set(part, offset);
            offset += part.length;
          }
          pcmBufferRef.current = [];
          pcmSampleCountRef.current = 0;

          void transcribeChunk(merged)
            .then((text) => {
              setMicChunksProcessed((c) => c + 1);
              if (text && text.trim().length > 1 && !/^\s*\[.*\]\s*$/.test(text)) {
                onTranscriptChunk(convId, text.trim());
              }
            })
            .catch((err: unknown) => {
              const message = err instanceof Error ? err.message : 'Live transcription failed';
              setErrorBanner(message);
            });
        }
      };

      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(ctx.destination);
      setIsRecording(true);
    } catch (err) {
      const reason =
        err instanceof Error ? err.message : 'Microphone permission denied or unavailable';
      stopMicAndClearBuffers();
      setErrorBanner(
        `Live call check could not start: ${reason}. Check microphone permission, then try again or upload a recording.`
      );
      setMode('upload');
    }
  };

  const scoreToneClass =
    callRiskLevel === 'red'
      ? 'text-red-600 dark:text-red-400'
      : callRiskLevel === 'amber'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-emerald-600 dark:text-emerald-400';

  return (
    <div className="flex flex-col xl:grid h-full xl:grid-cols-12 overflow-hidden">
      {/* Mobile / Tablet 2-tab switcher so RiskPanel is never hidden off-screen */}
      <div
        role="tablist"
        aria-label="Call view tabs"
        className="xl:hidden grid grid-cols-2 shrink-0 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'transcript'}
          onClick={() => setMobileTab('transcript')}
          className={`min-h-[44px] flex items-center justify-center gap-1.5 border-b-2 px-3 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            mobileTab === 'transcript'
              ? 'border-blue-700 text-blue-700 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400'
          }`}
        >
          <span>{tr.nav.callMode}</span>
          <span className="font-mono tabular-nums text-[11px] opacity-80">
            ({callConversation?.messages.length ?? 0})
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'risk'}
          onClick={() => setMobileTab('risk')}
          className={`min-h-[44px] flex items-center justify-center gap-1.5 border-b-2 px-3 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            mobileTab === 'risk'
              ? 'border-blue-700 text-blue-700 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400'
          }`}
        >
          <span>{tr.risk.safetyCheck}</span>
          <span className={`font-mono tabular-nums font-bold ${scoreToneClass}`}>
            {callScore}/100
          </span>
        </button>
      </div>

      {/* Left/Center: Call Capture & Live Transcript */}
      <div
        className={`xl:col-span-8 flex-1 min-h-0 flex-col overflow-hidden xl:border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 ${
          mobileTab === 'transcript' ? 'flex' : 'hidden xl:flex'
        }`}
      >
        {/* Controls Header */}
        <div className="border-b border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {tr.callMode.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tr.callMode.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                id="whisper-lang"
                aria-label="Speech transcription language"
                value={speechLanguage}
                onChange={(e) =>
                  setSpeechLanguage(e.target.value as 'auto' | 'en' | 'hi' | 'te' | 'mr')
                }
                className="w-full sm:w-auto min-h-[44px] sm:min-h-0 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:py-1.5 text-base sm:text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="auto">Auto (EN / HI / TE / MR)</option>
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
          </div>

          {/* Whisper model loading progress */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 min-w-0">
                {whisperStatus.state === 'loading' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
                ) : whisperStatus.state === 'ready' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                )}
                <span className="truncate">{whisperStatus.statusText}</span>
              </span>
              <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                {whisperStatus.progress}%
              </span>
            </div>
            {whisperStatus.state === 'loading' && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${whisperStatus.progress}%` }}
                />
              </div>
            )}
          </div>

          {/* Mode Tabs: Upload First, then Live Mic */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <div
              role="tablist"
              aria-label="Call input method"
              className="grid grid-cols-2 sm:inline-flex w-full sm:w-auto rounded-lg bg-slate-100 p-1 dark:bg-slate-800"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'upload'}
                onClick={() => {
                  if (isRecording) stopMicAndClearBuffers();
                  setMode('upload');
                }}
                className={`min-h-[42px] sm:min-h-0 inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'upload'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5 shrink-0" />
                {tr.callMode.uploadTab}
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={mode === 'mic'}
                onClick={() => setMode('mic')}
                className={`min-h-[42px] sm:min-h-0 inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'mic'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Mic className="w-3.5 h-3.5 shrink-0" />
                {tr.callMode.micTab}
              </button>
            </div>

            {mode === 'upload' ? (
              <div className="flex items-center w-full sm:w-auto">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  disabled={isProcessingFile}
                  className="hidden"
                  id="call-audio-upload"
                />
                <label
                  htmlFor="call-audio-upload"
                  className={`w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm sm:text-xs font-semibold text-white hover:bg-blue-800 transition-colors cursor-pointer whitespace-nowrap ${
                    isProcessingFile ? 'opacity-60 pointer-events-none' : ''
                  }`}
                >
                  <FileAudio className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
                  {isProcessingFile ? tr.callMode.transcribing : tr.callMode.chooseFile}
                </label>
              </div>
            ) : (
              <div className="flex items-center w-full sm:w-auto">
                {isRecording ? (
                  <button
                    type="button"
                    onClick={stopMicAndClearBuffers}
                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm sm:text-xs font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <MicOff className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
                    {tr.callMode.stopListening} ({micChunksProcessed})
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startLiveMic}
                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm sm:text-xs font-semibold text-white hover:bg-blue-800 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Mic className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
                    {tr.callMode.startLive}
                  </button>
                )}
              </div>
            )}
          </div>

          {errorBanner && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorBanner}</span>
            </div>
          )}

          {selectedFileName && fileProgress && (
            <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between gap-2">
              <span className="truncate font-medium">{selectedFileName}</span>
              <span className="font-mono tabular-nums shrink-0">
                {fileProgress.current} / {fileProgress.total}
              </span>
            </div>
          )}
        </div>

        {/* Live Transcript Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 pb-8 space-y-3 sm:space-y-4">
          {!callConversation || callConversation.messages.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
              <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src="/images/account-safety.jpg"
                  alt="Phone with a lock symbol, representing safer phone use"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4 sm:p-5 space-y-3">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {tr.callMode.guideTitle}
                </h2>
                <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="font-mono font-semibold text-blue-700 dark:text-blue-400">01</span>
                    <span>{tr.callMode.guideStep1}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-mono font-semibold text-blue-700 dark:text-blue-400">02</span>
                    <span>{tr.callMode.guideStep2}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-mono font-semibold text-blue-700 dark:text-blue-400">03</span>
                    <span>{tr.callMode.guideStep3}</span>
                  </li>
                </ol>
              </div>
            </div>
          ) : (
            callConversation.messages.map((chunk, index) => (
              <div
                key={chunk.id}
                className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-mono tabular-nums">
                    #{index + 1} · {chunk.timestamp}
                  </span>
                  {chunk.tactics.length > 0 && (
                    <span className="font-medium text-red-600 dark:text-red-400">
                      {chunk.tactics.map((t) => tr.tactics[t].shortLabel).join(' · ')}
                    </span>
                  )}
                </div>
                <div className="text-sm leading-relaxed text-slate-900 dark:text-slate-100">
                  <Underline text={chunk.text} spans={chunk.spans} language={uiLanguage} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: Live Sequence Risk & Timeline for Call */}
      <div
        className={`xl:col-span-4 flex-1 min-h-0 h-full overflow-hidden border-t xl:border-t-0 border-slate-200 dark:border-slate-800 ${
          mobileTab === 'risk' ? 'block' : 'hidden xl:block'
        }`}
      >
        <RiskPanel
          language={uiLanguage}
          conversation={callConversation}
          learnedCount={learnedCount}
          learnedPrototypes={learnedPrototypes}
          onTeachPattern={onTeachPattern}
        />
      </div>
    </div>
  );
};
