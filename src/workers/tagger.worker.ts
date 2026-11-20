import { env, pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers';
import {
  computeLocalSemanticEmbedding,
  LOCAL_SAFE_THRESHOLD,
  LOCAL_SIMILARITY_THRESHOLD,
} from '../engine/localSemantic';
import { TACTIC_PROTOTYPES } from '../engine/prototypes';
import { analyzeRules } from '../engine/rules';
import {
  matchSemanticTactics,
  SAFE_SIMILARITY_THRESHOLD,
  SIMILARITY_THRESHOLD,
  splitIntoClauses,
  type EmbeddedPrototype,
  type LearnedPrototype,
  type TaggerResult,
} from '../engine/tagger';

env.allowLocalModels = false;
env.useBrowserCache = true;
env.useWasmCache = true;

const MODEL_ID = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';

type WorkerRequest =
  | { type: 'init' }
  | {
      type: 'analyze';
      requestId: string;
      conversationId: string;
      messageId: string;
      text: string;
      learnedPrototypes: LearnedPrototype[];
    }
  | {
      type: 'embed';
      requestId: string;
      text: string;
    }
  | {
      type: 'self-test';
      requestId: string;
      text: string;
      learnedPrototypes: LearnedPrototype[];
    };

type WorkerResponse =
  | { type: 'progress'; progress: number; status: string; file?: string }
  | { type: 'ready'; engineMode: 'minilm' | 'local-vector' }
  | { type: 'error'; error: string }
  | {
      type: 'analyzed';
      requestId: string;
      conversationId: string;
      messageId: string;
      result: TaggerResult;
      modelUsed: boolean;
      latencyMs: number;
    }
  | {
      type: 'embedded';
      requestId: string;
      embedding: number[] | null;
      space: 'minilm' | 'local-vector';
    }
  | {
      type: 'self-test-result';
      requestId: string;
      result: TaggerResult;
      latencyMs: number;
    };

let extractor: FeatureExtractionPipeline | null = null;
let builtInPrototypes: EmbeddedPrototype[] = [];
let initPromise: Promise<void> | null = null;
let modelLoadAttempted = false;
let modelLoadFailed = false;

// Immediately available zero-network 512-dim local semantic prototype index
const localBuiltInPrototypes: EmbeddedPrototype[] = TACTIC_PROTOTYPES.map((proto) => ({
  tactic: proto.tactic,
  text: proto.text,
  embedding: computeLocalSemanticEmbedding(proto.text),
}));

function post(msg: WorkerResponse) {
  self.postMessage(msg);
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  if (!extractor || texts.length === 0) return [];
  const output = await extractor(texts, { pooling: 'mean', normalize: true });
  const raw = output.tolist() as number[][] | number[];
  if (texts.length === 1 && typeof raw[0] === 'number') {
    return [raw as number[]];
  }
  return raw as number[][];
}

function analyzeWithLocalSemantic(
  text: string,
  learnedPrototypes: LearnedPrototype[]
): TaggerResult {
  const clauses = splitIntoClauses(text);
  const fullEmbedding = computeLocalSemanticEmbedding(text);
  const clauseEmbeddings = clauses.map((clause) => ({
    clause,
    embedding: computeLocalSemanticEmbedding(clause.text),
  }));

  return matchSemanticTactics(
    text,
    fullEmbedding,
    clauseEmbeddings,
    localBuiltInPrototypes,
    learnedPrototypes,
    LOCAL_SIMILARITY_THRESHOLD,
    'local-vector',
    LOCAL_SAFE_THRESHOLD
  );
}

async function ensureModelLoaded(): Promise<void> {
  if (extractor && builtInPrototypes.length > 0) return;
  if (initPromise) return initPromise;
  if (modelLoadFailed) return;

  modelLoadAttempted = true;
  let lastProgressPct = -1;
  let lastProgressAt = 0;

  initPromise = (async () => {
    try {
      post({
        type: 'progress',
        progress: 5,
        status: 'Offline semantic engine active · loading MiniLM weights...',
      });
      extractor = await pipeline('feature-extraction', MODEL_ID, {
        dtype: 'q8',
        progress_callback: (info: { status?: string; progress?: number; file?: string }) => {
          if (typeof info.progress === 'number') {
            const pct = Math.min(92, Math.max(5, Math.round(info.progress * 0.9)));
            const now = Date.now();
            if (pct === lastProgressPct || (now - lastProgressAt < 180 && pct < 90)) {
              return;
            }
            lastProgressPct = pct;
            lastProgressAt = now;
            post({
              type: 'progress',
              progress: pct,
              status: info.status ?? 'Caching on-device neural weights...',
              file: info.file,
            });
          }
        },
      });

      post({ type: 'progress', progress: 94, status: 'Indexing multilingual scam prototypes...' });
      const vectors = await embedBatch(TACTIC_PROTOTYPES.map((p) => p.text));
      builtInPrototypes = TACTIC_PROTOTYPES.map((proto, idx) => ({
        tactic: proto.tactic,
        text: proto.text,
        embedding: vectors[idx] ?? [],
      }));

      post({ type: 'progress', progress: 100, status: 'On-device MiniLM AI ready (offline cached)' });
      post({ type: 'ready', engineMode: 'minilm' });
    } catch (err) {
      modelLoadFailed = true;
      initPromise = null;
      const message = err instanceof Error ? err.message : 'MiniLM offline — local semantic AI active';
      post({ type: 'error', error: message });
    }
  })();

  return initPromise;
}

self.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  const data = event.data;

  if (data.type === 'init') {
    modelLoadFailed = false;
    await ensureModelLoaded();
    return;
  }

  if (data.type === 'embed') {
    if (extractor) {
      const [vec] = await embedBatch([data.text]);
      post({
        type: 'embedded',
        requestId: data.requestId,
        embedding: vec ?? null,
        space: 'minilm',
      });
      return;
    }

    // Immediate offline fallback embedding so adaptive learning works without waiting for downloads
    const localVec = computeLocalSemanticEmbedding(data.text);
    post({
      type: 'embedded',
      requestId: data.requestId,
      embedding: localVec,
      space: 'local-vector',
    });
    return;
  }

  if (data.type === 'self-test') {
    const startMs = performance.now();
    if (!extractor || builtInPrototypes.length === 0) {
      const result = analyzeWithLocalSemantic(data.text, data.learnedPrototypes);
      post({
        type: 'self-test-result',
        requestId: data.requestId,
        result,
        latencyMs: Math.max(1, Math.round(performance.now() - startMs)),
      });
      return;
    }
    try {
      const clauses = splitIntoClauses(data.text);
      const textsToEmbed = [data.text, ...clauses.map((c) => c.text)];
      const vectors = await embedBatch(textsToEmbed);
      const fullEmbedding = vectors[0] ?? null;
      const clauseEmbeddings = clauses.map((clause, idx) => ({
        clause,
        embedding: vectors[idx + 1] ?? [],
      }));
      const result = matchSemanticTactics(
        data.text,
        fullEmbedding,
        clauseEmbeddings,
        builtInPrototypes,
        data.learnedPrototypes,
        SIMILARITY_THRESHOLD,
        'minilm',
        SAFE_SIMILARITY_THRESHOLD
      );
      post({
        type: 'self-test-result',
        requestId: data.requestId,
        result,
        latencyMs: Math.max(1, Math.round(performance.now() - startMs)),
      });
    } catch {
      const result = analyzeWithLocalSemantic(data.text, data.learnedPrototypes);
      post({
        type: 'self-test-result',
        requestId: data.requestId,
        result,
        latencyMs: Math.max(1, Math.round(performance.now() - startMs)),
      });
    }
    return;
  }

  if (data.type === 'analyze') {
    const startMs = performance.now();

    // If MiniLM isn't loaded yet (or offline uncached), run the local 512-dim semantic vector AI immediately
    if (!extractor || builtInPrototypes.length === 0) {
      if (!modelLoadAttempted) {
        void ensureModelLoaded();
      }
      const result = analyzeWithLocalSemantic(data.text, data.learnedPrototypes);
      const latencyMs = Math.max(1, Math.round(performance.now() - startMs));
      post({
        type: 'analyzed',
        requestId: data.requestId,
        conversationId: data.conversationId,
        messageId: data.messageId,
        modelUsed: true,
        latencyMs,
        result,
      });
      return;
    }

    try {
      const clauses = splitIntoClauses(data.text);
      const textsToEmbed = [data.text, ...clauses.map((c) => c.text)];
      const vectors = await embedBatch(textsToEmbed);
      const fullEmbedding = vectors[0] ?? null;
      const clauseEmbeddings = clauses.map((clause, idx) => ({
        clause,
        embedding: vectors[idx + 1] ?? [],
      }));

      const result = matchSemanticTactics(
        data.text,
        fullEmbedding,
        clauseEmbeddings,
        builtInPrototypes,
        data.learnedPrototypes,
        SIMILARITY_THRESHOLD,
        'minilm',
        SAFE_SIMILARITY_THRESHOLD
      );

      const latencyMs = Math.max(1, Math.round(performance.now() - startMs));
      post({
        type: 'analyzed',
        requestId: data.requestId,
        conversationId: data.conversationId,
        messageId: data.messageId,
        modelUsed: true,
        latencyMs,
        result,
      });
    } catch {
      // Fallback to local semantic vector AI rather than dropping to bare regex
      try {
        const result = analyzeWithLocalSemantic(data.text, data.learnedPrototypes);
        const latencyMs = Math.max(1, Math.round(performance.now() - startMs));
        post({
          type: 'analyzed',
          requestId: data.requestId,
          conversationId: data.conversationId,
          messageId: data.messageId,
          modelUsed: true,
          latencyMs,
          result,
        });
      } catch {
        const ruleOnly = analyzeRules(data.text);
        const latencyMs = Math.max(1, Math.round(performance.now() - startMs));
        post({
          type: 'analyzed',
          requestId: data.requestId,
          conversationId: data.conversationId,
          messageId: data.messageId,
          modelUsed: false,
          latencyMs,
          result: {
            tactics: ruleOnly.tactics,
            spans: ruleOnly.spans,
            hardSignals: ruleOnly.hardSignals,
            embedding: null,
            learnedScamMatch: false,
            learnedSafeMatch: false,
            engineMode: 'rules',
            semanticConfidence: 0,
          },
        });
      }
    }
  }
});
