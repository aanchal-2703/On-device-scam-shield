# ScamShield

Privacy-first scam and manipulation sequence detector running 100% locally inside your browser.

## How it works

ScamShield detects the **sequence of manipulation tactics** across a conversation or phone call rather than relying solely on isolated keywords:

1. **Stage 1 — Per-message tactic tagger (`src/workers/tagger.worker.ts`)**: Combines deterministic domain/UPI/regex rules (`src/engine/rules.ts`) with on-device multilingual embeddings (`Xenova/paraphrase-multilingual-MiniLM-L12-v2`) across English, Hindi, Telugu, and Hinglish prototypes (`src/engine/prototypes.ts`).
2. **Stage 2 — Sequence scorer (`src/engine/sequence.ts`)**: Tracks progression across `Authority → Urgency → Fear → Isolation → Payment`. Isolated mentions (e.g., a real bank debit alert or doorstep delivery OTP) stay Green, whereas multi-stage escalation jumps to Red (`>= 80`).
3. **Stage 3 — Template explanation & safety actions (`src/engine/explain.ts`)**: Generates plain-language attack narratives and verified next steps (e.g., `1930`, `cybercrime.gov.in`) without any LLM calls.
4. **Call Mode (`src/workers/whisper.worker.ts`)**: After explicit consent, transcribes uploaded call recordings or live speaker-mode microphone audio in 5-second chunks using `Xenova/whisper-tiny` locally on-device.
5. **Privacy by design (`src/store.ts`, `src/components/PrivacyPanel.tsx`)**: Memory-only Zustand store (`no persist`, `no localStorage`, `no sessionStorage`, `no cookies`, `no IndexedDB` for user data), zero user-data network requests, and a one-click **Wipe session** button.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in Chrome.

## Testing in Chrome

1. **Demo playback**: Select any conversation in the Inbox (try *Telecom Care (Slow-Burn)* or *Inspector Verma*) and click **Play demo** to watch messages arrive every 2 seconds, inline underlines appear, and the Manipulation Timeline light up stage by stage.
2. **Inline inspection**: Hover or tap any yellow/red underlined span to read why the phrase was flagged.
3. **Adaptive learning**: Click **Mark as scam** or **Mark as safe** on any message to update in-memory prototypes immediately.
4. **Call Mode**: Click **Check this call**, confirm the local-audio consent dialog, and upload an audio file (`.wav`, `.mp3`, `.m4a`, `.webm`) or test live speaker mic.
5. **Offline / Airplane Mode**: Once the app shell and model weights finish loading, open Chrome DevTools → **Network** → check **Offline**, reload the page, and verify that detection continues working with zero network access.
6. **Wipe session**: Click **Wipe session** in the top bar to reset transcripts, audio buffers, and learned prototypes from memory.

## Android companion

The Android app wraps the same local ScamShield web app and detection engine. Build/sync it with:

```bash
npm run android:sync
npx cap open android
```

In the Android app, **Protect apps** opens the Android settings for two optional permissions:

- **Notification access** forwards message notification previews to ScamShield.
- **Accessibility access** can read visible text in other apps and displays the floating ScamShield button. Tap that button to open the app and review captured content.
- **Share to ScamShield** lets you send selected text from another app through Android's Share menu; it uses the same detector and needs no additional permission.

Only enable the access you want. Captured content is passed to the existing detector on-device, held in memory only, and cleared by **Wipe session**. Android may stop background app work; content captured while the app runtime is unavailable is only queued in memory and is checked when ScamShield resumes. No cross-app content is uploaded.

Android does not let ordinary apps read internal cellular-call audio. For calls, use the existing Call Mode with speakerphone and microphone access, or analyze a saved recording.
