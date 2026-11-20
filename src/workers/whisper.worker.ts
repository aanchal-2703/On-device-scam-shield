import { env, pipeline, type AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;
env.useWasmCache = true;

const WHISPER_MODEL_ID = 'Xenova/whisper-tiny';

type WhisperRequest =
  | { type: 'init' }
  | {
      type: 'transcribe';
      requestId: string;
      audio: Float32Array;
      language?: string;
    };

type WhisperResponse =
  | { type: 'progress'; progress: number; status: string; file?: string }
  | { type: 'ready' }
  | { type: 'error'; error: string; requestId?: string }
  | { type: 'transcript'; requestId: string; text: string };

let asr: AutomaticSpeechRecognitionPipeline | null = null;
let initPromise: Promise<void> | null = null;

function post(msg: WhisperResponse) {
  self.postMessage(msg);
}

async function ensureWhisperLoaded(): Promise<void> {
  if (asr) return;
  if (initPromise) return initPromise;

  let lastPct = -1;
  let lastAt = 0;

  initPromise = (async () => {
    try {
      post({ type: 'progress', progress: 5, status: 'Loading multilingual Whisper-tiny speech model...' });
      asr = await pipeline('automatic-speech-recognition', WHISPER_MODEL_ID, {
        dtype: 'q8',
        progress_callback: (info: { status?: string; progress?: number; file?: string }) => {
          if (typeof info.progress === 'number') {
            const pct = Math.min(98, Math.max(5, Math.round(info.progress)));
            const now = Date.now();
            if (pct === lastPct || (now - lastAt < 180 && pct < 96)) {
              return;
            }
            lastPct = pct;
            lastAt = now;
            post({
              type: 'progress',
              progress: pct,
              status: info.status ?? 'Downloading Whisper-tiny weights...',
              file: info.file,
            });
          }
        },
      });
      post({ type: 'progress', progress: 100, status: 'On-device speech engine ready' });
      post({ type: 'ready' });
    } catch (err) {
      initPromise = null;
      const message = err instanceof Error ? err.message : 'Failed to load Whisper-tiny model';
      post({ type: 'error', error: message });
    }
  })();

  return initPromise;
}

self.addEventListener('message', async (event: MessageEvent<WhisperRequest>) => {
  const data = event.data;

  if (data.type === 'init') {
    await ensureWhisperLoaded();
    return;
  }

  if (data.type === 'transcribe') {
    try {
      await ensureWhisperLoaded();
      if (!asr) {
        post({ type: 'error', requestId: data.requestId, error: 'Speech model unavailable' });
        return;
      }
      const options: Record<string, unknown> = {
        chunk_length_s: 30,
        stride_length_s: 5,
        task: 'transcribe',
      };
      if (data.language && data.language !== 'auto') {
        options.language = data.language;
      }

      const output = await asr(data.audio, options);
      const rawText = Array.isArray(output) ? output[0]?.text ?? '' : output?.text ?? '';
      const text = rawText.trim();
      post({ type: 'transcript', requestId: data.requestId, text });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transcription error';
      post({ type: 'error', requestId: data.requestId, error: message });
    }
  }
});
