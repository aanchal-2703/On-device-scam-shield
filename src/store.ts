import { create } from 'zustand';
import { DEMO_CONVERSATIONS, type DemoConversation } from './data/demo';
import { computeLocalSemanticEmbedding } from './engine/localSemantic';
import type { TacticId } from './engine/prototypes';
import { analyzeRules, type RuleAnalysisResult, type SpanMatch } from './engine/rules';
import {
  createEmptyRiskState,
  evaluateConversationSequence,
  type ConversationRiskState,
  type MessageEvaluationInput,
} from './engine/sequence';
import type { LearnedPrototype, SemanticEngineMode, TaggerResult } from './engine/tagger';
import { stopSpeaking } from './engine/speechTts';
import type { AppLanguage } from './i18n';

export interface AnalyzedMessage {
  id: string;
  sender: 'them' | 'me' | 'caller';
  text: string;
  timestamp: string;
  tactics: TacticId[];
  spans: SpanMatch[];
  hardSignals: RuleAnalysisResult['hardSignals'];
  embedding: number[] | null;
  learnedScamMatch: boolean;
  learnedSafeMatch: boolean;
  analyzedByModel: boolean;
  engineMode: SemanticEngineMode;
  semanticConfidence: number;
  userFeedback?: 'scam' | 'safe';
}

export interface Conversation {
  id: string;
  title: string;
  handle: string;
  channel: 'SMS' | 'WhatsApp' | 'Voice Call' | 'Other App';
  category: 'legitimate' | 'scam' | 'live-call' | 'custom';
  summary: string;
  messages: AnalyzedMessage[];
  risk: ConversationRiskState;
}

export interface ModelStatus {
  state: 'idle' | 'loading' | 'ready' | 'error';
  progress: number;
  statusText: string;
}

export interface DemoPlaybackState {
  conversationId: string | null;
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
}

export interface LocalEngineStats {
  messagesAnalyzed: number;
  aiDetections: number;
  ruleDetections: number;
  lastLatencyMs: number;
  outboundUserBytes: number;
}

export interface SelfTestOutput {
  text: string;
  result: TaggerResult;
  latencyMs: number;
  risk: ConversationRiskState;
}

function buildRuleEvaluatedMessage(
  id: string,
  sender: 'them' | 'me' | 'caller',
  text: string,
  timestamp: string
): AnalyzedMessage {
  if (sender === 'me') {
    return {
      id,
      sender,
      text,
      timestamp,
      tactics: [],
      spans: [],
      hardSignals: {
        lookalikeDomain: false,
        knownScamDomain: false,
        knownScamNumber: false,
        suspiciousUpi: false,
        matchedIndicators: [],
      },
      embedding: null,
      learnedScamMatch: false,
      learnedSafeMatch: false,
      analyzedByModel: false,
      engineMode: 'rules',
      semanticConfidence: 0,
    };
  }
  const rules = analyzeRules(text);
  return {
    id,
    sender,
    text,
    timestamp,
    tactics: rules.tactics,
    spans: rules.spans,
    hardSignals: rules.hardSignals,
    embedding: null,
    learnedScamMatch: false,
    learnedSafeMatch: false,
    analyzedByModel: false,
    engineMode: 'rules',
    semanticConfidence: 0,
  };
}

function recomputeConversationRisk(
  messages: AnalyzedMessage[],
  learnedPrototypes: LearnedPrototype[]
): ConversationRiskState {
  const inputs: MessageEvaluationInput[] = messages.map((m) => {
    const explicitScam = m.userFeedback === 'scam' || m.learnedScamMatch;
    const explicitSafe = m.userFeedback === 'safe' || m.learnedSafeMatch;
    const hasLearned = learnedPrototypes.length > 0;
    return {
      messageId: m.id,
      timestamp: m.timestamp,
      sender: m.sender,
      tactics:
        explicitSafe && !m.hardSignals.knownScamDomain && !m.hardSignals.lookalikeDomain
          ? []
          : m.tactics,
      spans: m.spans,
      hardSignals: m.hardSignals,
      learnedScamMatch: explicitScam && (m.userFeedback === 'scam' || hasLearned),
      learnedSafeMatch: explicitSafe && (m.userFeedback === 'safe' || hasLearned),
    };
  });
  return evaluateConversationSequence(inputs);
}

function createInitialConversations(): Conversation[] {
  return DEMO_CONVERSATIONS.map((demo: DemoConversation) => {
    const messages = demo.messages.map((m) =>
      buildRuleEvaluatedMessage(m.id, m.sender, m.text, m.timestamp)
    );
    const risk = recomputeConversationRisk(messages, []);
    return {
      id: demo.id,
      title: demo.title,
      handle: demo.handle,
      channel: demo.channel,
      category: demo.category,
      summary: demo.summary,
      messages,
      risk,
    };
  });
}

interface QueuedAnalyzedUpdate {
  conversationId: string;
  messageId: string;
  result: TaggerResult;
  modelUsed: boolean;
  latencyMs?: number;
}

// Worker singleton & batching queue managed outside React render cycle
let taggerWorker: Worker | null = null;
let demoTimer: ReturnType<typeof setTimeout> | null = null;
let reqCounter = 0;
let analyzedBatchQueue: QueuedAnalyzedUpdate[] = [];
let flushTimer: ReturnType<typeof setTimeout> | number | null = null;

const pendingEmbedResolvers = new Map<
  string,
  (payload: { embedding: number[] | null; space: 'minilm' | 'local-vector' }) => void
>();
const pendingSelfTestResolvers = new Map<
  string,
  (payload: { result: TaggerResult; latencyMs: number }) => void
>();

function clearPendingAnalyzedBatch() {
  analyzedBatchQueue = [];
  if (flushTimer !== null) {
    if (typeof cancelAnimationFrame !== 'undefined' && typeof flushTimer === 'number') {
      cancelAnimationFrame(flushTimer);
      clearTimeout(flushTimer);
    } else {
      clearTimeout(flushTimer as ReturnType<typeof setTimeout>);
    }
    flushTimer = null;
  }
}

function nextRequestId(): string {
  reqCounter += 1;
  return `req-${Date.now()}-${reqCounter}`;
}

function formatNowTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function requestEmbedding(
  text: string
): Promise<{ embedding: number[] | null; space: 'minilm' | 'local-vector' }> {
  if (!taggerWorker) {
    return { embedding: computeLocalSemanticEmbedding(text), space: 'local-vector' };
  }
  const requestId = nextRequestId();
  return new Promise((resolve) => {
    pendingEmbedResolvers.set(requestId, resolve);
    taggerWorker!.postMessage({ type: 'embed', requestId, text });
    setTimeout(() => {
      if (pendingEmbedResolvers.has(requestId)) {
        pendingEmbedResolvers.delete(requestId);
        resolve({ embedding: computeLocalSemanticEmbedding(text), space: 'local-vector' });
      }
    }, 3000);
  });
}

interface ScamShieldStore {
  conversations: Conversation[];
  activeConversationId: string;
  searchQuery: string;
  filterRisk: 'all' | 'green' | 'amber' | 'red';
  darkMode: boolean;
  language: AppLanguage;
  activeView: 'overview' | 'inbox' | 'call';
  consentModalOpen: boolean;
  callConsentGranted: boolean;
  taggerStatus: ModelStatus;
  whisperStatus: ModelStatus;
  engineMode: SemanticEngineMode;
  localStats: LocalEngineStats;
  learnedPrototypes: LearnedPrototype[];
  demoPlayback: DemoPlaybackState;
  sessionWipedAt: number | null;
  activeAudioCleanup: (() => void) | null;

  initWorkers: () => void;
  setActiveConversation: (id: string) => void;
  setSearchQuery: (q: string) => void;
  setFilterRisk: (filter: 'all' | 'green' | 'amber' | 'red') => void;
  toggleDarkMode: () => void;
  setLanguage: (language: AppLanguage) => void;
  setActiveView: (view: 'overview' | 'inbox' | 'call') => void;
  openCallConsent: () => void;
  closeCallConsent: () => void;
  grantCallConsent: () => void;
  setWhisperStatus: (status: Partial<ModelStatus>) => void;
  registerAudioCleanup: (fn: (() => void) | null) => void;

  playDemo: (conversationId: string) => void;
  stopDemo: () => void;
  sendMessage: (
    conversationId: string,
    text: string,
    sender: 'them' | 'me' | 'caller',
    overrideId?: string,
    overrideTimestamp?: string
  ) => void;
  createCustomCheck: (
    title: string,
    channel: 'SMS' | 'WhatsApp' | 'Voice Call' | 'Other App'
  ) => string;
  ensureLiveCallConversation: () => string;
  markMessageFeedback: (
    conversationId: string,
    messageId: string,
    kind: 'scam' | 'safe'
  ) => Promise<void>;
  teachUnseenPattern: (
    text: string,
    kind: 'scam' | 'safe',
    tactic?: TacticId
  ) => Promise<void>;
  runOfflineSelfTest: (text: string) => Promise<SelfTestOutput>;
  reanalyzeConversation: (conversationId: string) => void;
  wipe: () => void;
}

export const useScamShieldStore = create<ScamShieldStore>((set, get) => {
  const flushAnalyzedBatch = () => {
    flushTimer = null;
    if (analyzedBatchQueue.length === 0) return;

    const batch = analyzedBatchQueue;
    analyzedBatchQueue = [];

    const byConv = new Map<string, Map<string, QueuedAnalyzedUpdate>>();
    let aiInc = 0;
    let ruleInc = 0;
    let latestLatency: number | undefined;

    for (const item of batch) {
      let msgMap = byConv.get(item.conversationId);
      if (!msgMap) {
        msgMap = new Map();
        byConv.set(item.conversationId, msgMap);
      }
      msgMap.set(item.messageId, item);
      if (item.result.spans.some((s) => s.source === 'semantic')) aiInc += 1;
      if (item.result.spans.some((s) => s.source === 'rule')) ruleInc += 1;
      if (typeof item.latencyMs === 'number') latestLatency = item.latencyMs;
    }

    set((state) => {
      const conversations = state.conversations.map((conv) => {
        const msgMap = byConv.get(conv.id);
        if (!msgMap) return conv;

        const messages = conv.messages.map((m) => {
          const update = msgMap.get(m.id);
          if (!update) return m;
          const { result, modelUsed } = update;
          return {
            ...m,
            tactics: result.tactics,
            spans: result.spans,
            hardSignals: result.hardSignals,
            embedding: result.embedding ?? m.embedding,
            learnedScamMatch: result.learnedScamMatch,
            learnedSafeMatch: result.learnedSafeMatch,
            analyzedByModel: modelUsed || m.analyzedByModel,
            engineMode: result.engineMode,
            semanticConfidence: result.semanticConfidence,
          };
        });

        return {
          ...conv,
          messages,
          risk: recomputeConversationRisk(messages, state.learnedPrototypes),
        };
      });

      return {
        conversations,
        localStats: {
          messagesAnalyzed: state.localStats.messagesAnalyzed + batch.length,
          aiDetections: state.localStats.aiDetections + aiInc,
          ruleDetections: state.localStats.ruleDetections + ruleInc,
          lastLatencyMs: latestLatency ?? state.localStats.lastLatencyMs,
          outboundUserBytes: 0,
        },
      };
    });
  };

  const scheduleBatchFlush = () => {
    if (flushTimer !== null) return;
    if (typeof requestAnimationFrame !== 'undefined') {
      flushTimer = requestAnimationFrame(flushAnalyzedBatch);
    } else {
      flushTimer = setTimeout(flushAnalyzedBatch, 16);
    }
  };

  return {
    conversations: createInitialConversations(),
    activeConversationId: DEMO_CONVERSATIONS[3].id,
    searchQuery: '',
    filterRisk: 'all',
    darkMode: false,
    language: 'en',
    activeView: 'overview',
    consentModalOpen: false,
    callConsentGranted: false,
    taggerStatus: { state: 'idle', progress: 0, statusText: 'Offline Semantic AI ready' },
    whisperStatus: {
      state: 'idle',
      progress: 0,
      statusText: 'Speech model loads on demand in Call Mode',
    },
    engineMode: 'local-vector',
    localStats: {
      messagesAnalyzed: 0,
      aiDetections: 0,
      ruleDetections: 0,
      lastLatencyMs: 2,
      outboundUserBytes: 0,
    },
    learnedPrototypes: [],
    demoPlayback: {
      conversationId: null,
      isPlaying: false,
      currentStep: 0,
      totalSteps: 0,
    },
    sessionWipedAt: null,
    activeAudioCleanup: null,

    initWorkers: () => {
      if (taggerWorker || typeof Worker === 'undefined') return;
      try {
        taggerWorker = new Worker(new URL('./workers/tagger.worker.ts', import.meta.url), {
          type: 'module',
        });

        set({
          engineMode: 'local-vector',
          taggerStatus: {
            state: 'loading',
            progress: 5,
            statusText: 'Offline Semantic AI active · loading MiniLM...',
          },
        });

        taggerWorker.onmessage = (event: MessageEvent) => {
          const msg = event.data;
          if (msg.type === 'progress') {
            const cur = get().taggerStatus;
            if (
              cur.state === 'loading' &&
              cur.progress === msg.progress &&
              cur.statusText === msg.status
            ) {
              return;
            }
            set({
              taggerStatus: {
                state: 'loading',
                progress: msg.progress,
                statusText: msg.status,
              },
            });
          } else if (msg.type === 'ready') {
            set({
              engineMode: 'minilm',
              taggerStatus: {
                state: 'ready',
                progress: 100,
                statusText: 'MiniLM Neural AI ready (offline cached)',
              },
            });

            // Upgrade any existing local-vector learned prototypes to MiniLM embeddings
            const currentLearned = get().learnedPrototypes;
            if (currentLearned.length > 0) {
              void Promise.all(
                currentLearned.map(async (lp) => {
                  if (lp.space === 'minilm') return lp;
                  const embedded = await requestEmbedding(lp.text);
                  return embedded.embedding
                    ? { ...lp, embedding: embedded.embedding, space: embedded.space }
                    : lp;
                })
              ).then((upgraded) => {
                set({ learnedPrototypes: upgraded });
                for (const c of get().conversations) {
                  get().reanalyzeConversation(c.id);
                }
              });
            } else {
              // Reanalyze all conversations with full 384-dim MiniLM neural embeddings
              for (const c of get().conversations) {
                get().reanalyzeConversation(c.id);
              }
            }
          } else if (msg.type === 'error') {
            // Keep Offline Semantic AI running cleanly even if HuggingFace weights cannot download
            const cur = get().taggerStatus;
            if (cur.state === 'error') return;
            set({
              engineMode: 'local-vector',
              taggerStatus: {
                state: 'error',
                progress: 0,
                statusText: 'Offline Semantic AI active (local vectors + rules)',
              },
            });
          } else if (msg.type === 'embedded') {
            const resolver = pendingEmbedResolvers.get(msg.requestId);
            if (resolver) {
              pendingEmbedResolvers.delete(msg.requestId);
              resolver({ embedding: msg.embedding, space: msg.space ?? 'local-vector' });
            }
          } else if (msg.type === 'self-test-result') {
            const resolver = pendingSelfTestResolvers.get(msg.requestId);
            if (resolver) {
              pendingSelfTestResolvers.delete(msg.requestId);
              resolver({ result: msg.result, latencyMs: msg.latencyMs });
            }
          } else if (msg.type === 'analyzed') {
            const { conversationId, messageId, result, modelUsed, latencyMs } = msg as {
              conversationId: string;
              messageId: string;
              result: TaggerResult;
              modelUsed: boolean;
              latencyMs?: number;
            };
            analyzedBatchQueue.push({
              conversationId,
              messageId,
              result,
              modelUsed,
              latencyMs,
            });
            scheduleBatchFlush();
          }
        };

        taggerWorker.postMessage({ type: 'init' });

        // Immediately analyze all preloaded conversations with offline local semantic vectors
        for (const c of get().conversations) {
          get().reanalyzeConversation(c.id);
        }
      } catch {
        set({
          engineMode: 'rules',
          taggerStatus: {
            state: 'error',
            progress: 0,
            statusText: 'Worker unavailable — deterministic rule engine active',
          },
        });
      }
    },

    setActiveConversation: (id) => {
      set({ activeConversationId: id, activeView: 'inbox' });
      const conv = get().conversations.find((c) => c.id === id);
      const needsAnalysis = conv?.messages.some(
        (m) =>
          m.sender !== 'me' &&
          (!m.analyzedByModel || (get().engineMode === 'minilm' && m.engineMode !== 'minilm'))
      );
      if (needsAnalysis) {
        get().reanalyzeConversation(id);
      }
    },

    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setFilterRisk: (filterRisk) => set({ filterRisk }),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  setLanguage: (language) => set({ language }),
  setActiveView: (activeView) => set({ activeView }),

  openCallConsent: () => {
    if (get().callConsentGranted) {
      set({ activeView: 'call' });
    } else {
      set({ consentModalOpen: true });
    }
  },
  closeCallConsent: () => set({ consentModalOpen: false }),
  grantCallConsent: () =>
    set({
      callConsentGranted: true,
      consentModalOpen: false,
      activeView: 'call',
    }),

  setWhisperStatus: (partial) =>
    set((s) => {
      const next = { ...s.whisperStatus, ...partial };
      if (
        next.state === s.whisperStatus.state &&
        next.progress === s.whisperStatus.progress &&
        next.statusText === s.whisperStatus.statusText
      ) {
        return s;
      }
      return { whisperStatus: next };
    }),

  registerAudioCleanup: (fn) =>
    set((s) => (s.activeAudioCleanup === fn ? s : { activeAudioCleanup: fn })),

  stopDemo: () => {
    if (demoTimer) {
      clearTimeout(demoTimer);
      demoTimer = null;
    }
    set({
      demoPlayback: {
        conversationId: null,
        isPlaying: false,
        currentStep: 0,
        totalSteps: 0,
      },
    });
  },

  playDemo: (conversationId) => {
    get().stopDemo();
    const demo = DEMO_CONVERSATIONS.find((d) => d.id === conversationId);
    if (!demo) return;

    set((state) => ({
      activeConversationId: conversationId,
      activeView: 'inbox',
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [], risk: createEmptyRiskState() }
          : c
      ),
      demoPlayback: {
        conversationId,
        isPlaying: true,
        currentStep: 0,
        totalSteps: demo.messages.length,
      },
    }));

    const deliverStep = (index: number) => {
      const currentPlayback = get().demoPlayback;
      if (!currentPlayback.isPlaying || currentPlayback.conversationId !== conversationId) {
        return;
      }
      if (index >= demo.messages.length) {
        set({
          demoPlayback: {
            conversationId: null,
            isPlaying: false,
            currentStep: demo.messages.length,
            totalSteps: demo.messages.length,
          },
        });
        return;
      }

      const item = demo.messages[index];
      get().sendMessage(conversationId, item.text, item.sender, item.id, item.timestamp);

      set({
        demoPlayback: {
          conversationId,
          isPlaying: true,
          currentStep: index + 1,
          totalSteps: demo.messages.length,
        },
      });

      if (index + 1 < demo.messages.length) {
        demoTimer = setTimeout(() => deliverStep(index + 1), 2000);
      } else {
        demoTimer = setTimeout(() => {
          set({
            demoPlayback: {
              conversationId: null,
              isPlaying: false,
              currentStep: demo.messages.length,
              totalSteps: demo.messages.length,
            },
          });
        }, 400);
      }
    };

    deliverStep(0);
  },

  sendMessage: (
    conversationId: string,
    text: string,
    sender: 'them' | 'me' | 'caller',
    overrideId?: string,
    overrideTimestamp?: string
  ) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const msgId = overrideId ?? `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const timestamp = overrideTimestamp ?? formatNowTime();
    const initialMsg = buildRuleEvaluatedMessage(msgId, sender, trimmed, timestamp);

    set((state) => {
      const conversations = state.conversations.map((conv) => {
        if (conv.id !== conversationId) return conv;
        const messages = [...conv.messages, initialMsg];
        return {
          ...conv,
          messages,
          risk: recomputeConversationRisk(messages, state.learnedPrototypes),
        };
      });
      return { conversations };
    });

    if (sender !== 'me' && taggerWorker) {
      taggerWorker.postMessage({
        type: 'analyze',
        requestId: nextRequestId(),
        conversationId,
        messageId: msgId,
        text: trimmed,
        learnedPrototypes: get().learnedPrototypes,
      });
    }
  },

  createCustomCheck: (title, channel) => {
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newConv: Conversation = {
      id,
      title: title.trim() || 'New Suspicious Thread',
      handle: channel === 'Voice Call' ? 'Unknown Caller' : 'Unverified Sender',
      channel,
      category: 'custom',
      summary: 'Custom on-device session',
      messages: [],
      risk: createEmptyRiskState(),
    };
    set((state) => ({
      conversations: [newConv, ...state.conversations],
      activeConversationId: id,
      activeView: 'inbox',
    }));
    return id;
  },

  ensureLiveCallConversation: () => {
    const existing = get().conversations.find((c) => c.id === 'live-call-session');
    if (existing) {
      return existing.id;
    }
    const callConv: Conversation = {
      id: 'live-call-session',
      title: 'Live Call Monitor',
      handle: 'On-device Whisper-tiny',
      channel: 'Voice Call',
      category: 'live-call',
      summary: 'Real-time local call transcript & sequence analysis',
      messages: [],
      risk: createEmptyRiskState(),
    };
    set((state) => ({
      conversations: [callConv, ...state.conversations],
      activeConversationId: callConv.id,
    }));
    return callConv.id;
  },

  reanalyzeConversation: (conversationId) => {
    const conv = get().conversations.find((c) => c.id === conversationId);
    if (!conv || !taggerWorker) return;
    const learned = get().learnedPrototypes;
    for (const m of conv.messages) {
      if (m.sender === 'me') continue;
      taggerWorker.postMessage({
        type: 'analyze',
        requestId: nextRequestId(),
        conversationId,
        messageId: m.id,
        text: m.text,
        learnedPrototypes: learned,
      });
    }
  },

  markMessageFeedback: async (conversationId, messageId, kind) => {
    const conv = get().conversations.find((c) => c.id === conversationId);
    const msg = conv?.messages.find((m) => m.id === messageId);
    if (!conv || !msg) return;

    let embedding = msg.embedding;
    let space: 'minilm' | 'local-vector' =
      msg.engineMode === 'minilm' ? 'minilm' : 'local-vector';

    if (!embedding || (get().engineMode === 'minilm' && space !== 'minilm')) {
      const embedded = await requestEmbedding(msg.text);
      embedding = embedded.embedding;
      space = embedded.space;
    }

    const newProto: LearnedPrototype | null = embedding
      ? {
          id: `learned-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          kind,
          tactic: msg.tactics[0] ?? 'payment',
          text: msg.text,
          embedding,
          space,
        }
      : null;

    set((state) => {
      const learnedPrototypes = newProto
        ? [...state.learnedPrototypes, newProto]
        : state.learnedPrototypes;

      const conversations = state.conversations.map((c) => {
        if (c.id !== conversationId) return c;
        const messages = c.messages.map((m) => {
          if (m.id !== messageId) return m;
          const updatedTactics =
            kind === 'scam' && m.tactics.length === 0
              ? (['payment'] as TacticId[])
              : kind === 'safe'
                ? []
                : m.tactics;
          return {
            ...m,
            embedding: embedding ?? m.embedding,
            userFeedback: kind,
            learnedScamMatch: kind === 'scam',
            learnedSafeMatch: kind === 'safe',
            tactics: updatedTactics,
            spans: kind === 'safe' ? [] : m.spans,
          };
        });
        return {
          ...c,
          messages,
          risk: recomputeConversationRisk(messages, learnedPrototypes),
        };
      });

      return { learnedPrototypes, conversations };
    });

    if (newProto) {
      for (const c of get().conversations) {
        get().reanalyzeConversation(c.id);
      }
    }
  },

  teachUnseenPattern: async (text, kind, tactic = 'payment') => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const embedded = await requestEmbedding(trimmed);
    if (!embedded.embedding) return;

    const newProto: LearnedPrototype = {
      id: `learned-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      kind,
      tactic,
      text: trimmed,
      embedding: embedded.embedding,
      space: embedded.space,
    };

    set((state) => ({
      learnedPrototypes: [...state.learnedPrototypes, newProto],
    }));

    for (const c of get().conversations) {
      get().reanalyzeConversation(c.id);
    }
  },

  runOfflineSelfTest: async (text) => {
    const trimmed = text.trim();
    const learned = get().learnedPrototypes;

    if (taggerWorker) {
      const requestId = nextRequestId();
      const workerOut = await new Promise<{ result: TaggerResult; latencyMs: number }>((resolve) => {
        pendingSelfTestResolvers.set(requestId, resolve);
        taggerWorker!.postMessage({
          type: 'self-test',
          requestId,
          text: trimmed,
          learnedPrototypes: learned,
        });
        setTimeout(() => {
          if (pendingSelfTestResolvers.has(requestId)) {
            pendingSelfTestResolvers.delete(requestId);
            const ruleOnly = analyzeRules(trimmed);
            resolve({
              latencyMs: 1,
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
        }, 3000);
      });

      const risk = evaluateConversationSequence([
        {
          messageId: 'self-test-1',
          timestamp: formatNowTime(),
          sender: 'them',
          tactics: workerOut.result.tactics,
          spans: workerOut.result.spans,
          hardSignals: workerOut.result.hardSignals,
          learnedScamMatch: workerOut.result.learnedScamMatch,
          learnedSafeMatch: workerOut.result.learnedSafeMatch,
        },
      ]);

      return {
        text: trimmed,
        result: workerOut.result,
        latencyMs: workerOut.latencyMs,
        risk,
      };
    }

    const rules = analyzeRules(trimmed);
    const result: TaggerResult = {
      tactics: rules.tactics,
      spans: rules.spans,
      hardSignals: rules.hardSignals,
      embedding: null,
      learnedScamMatch: false,
      learnedSafeMatch: false,
      engineMode: 'rules',
      semanticConfidence: 0,
    };
    const risk = evaluateConversationSequence([
      {
        messageId: 'self-test-1',
        timestamp: formatNowTime(),
        sender: 'them',
        tactics: result.tactics,
        spans: result.spans,
        hardSignals: result.hardSignals,
      },
    ]);
    return { text: trimmed, result, latencyMs: 1, risk };
  },

  wipe: () => {
    stopSpeaking();
    clearPendingAnalyzedBatch();
    get().stopDemo();
    const cleanup = get().activeAudioCleanup;
    if (cleanup) {
      cleanup();
    }
    pendingEmbedResolvers.clear();
    pendingSelfTestResolvers.clear();

    set({
      conversations: createInitialConversations(),
      activeConversationId: DEMO_CONVERSATIONS[3].id,
      searchQuery: '',
      filterRisk: 'all',
      callConsentGranted: false,
      consentModalOpen: false,
      learnedPrototypes: [],
      activeAudioCleanup: null,
      localStats: {
        messagesAnalyzed: 0,
        aiDetections: 0,
        ruleDetections: 0,
        lastLatencyMs: 0,
        outboundUserBytes: 0,
      },
      sessionWipedAt: Date.now(),
    });

    for (const c of get().conversations) {
      get().reanalyzeConversation(c.id);
    }
  },
  };
});
