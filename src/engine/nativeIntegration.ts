import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core';
import type { AppLanguage } from '../i18n';

export interface NativeCapturedContent {
  eventId: string;
  packageName: string;
  appLabel: string;
  source: 'notification' | 'screen' | 'share';
  text: string;
  capturedAt: number;
}

export interface NativeProtectionStatus {
  notificationAccess: boolean;
  screenAccess: boolean;
}

interface NativeContentBatch {
  events: NativeCapturedContent[];
}

interface ScamShieldNativePlugin {
  addListener(
    eventName: 'contentDetected',
    listener: (event: NativeCapturedContent) => void
  ): Promise<PluginListenerHandle>;
  getPendingContent(): Promise<NativeContentBatch>;
  getProtectionStatus(): Promise<NativeProtectionStatus>;
  openNotificationAccessSettings(): Promise<void>;
  openScreenAccessSettings(): Promise<void>;
  updateOverlayRisk(options: { score: number }): Promise<void>;
  clearPendingContent(): Promise<void>;
}

const NativePlugin = registerPlugin<ScamShieldNativePlugin>('ScamShieldNative');

export const isNativeAndroid = Capacitor.getPlatform() === 'android';

export async function connectNativeContent(
  onContent: (event: NativeCapturedContent) => void
): Promise<() => void> {
  if (!isNativeAndroid) return () => {};

  const listener = await NativePlugin.addListener('contentDetected', onContent);
  const pending = await NativePlugin.getPendingContent();
  for (const event of pending.events) {
    onContent(event);
  }
  return () => {
    void listener.remove();
  };
}

export async function getNativeProtectionStatus(): Promise<NativeProtectionStatus> {
  if (!isNativeAndroid) {
    return { notificationAccess: false, screenAccess: false };
  }
  return NativePlugin.getProtectionStatus();
}

export async function openNativeNotificationAccessSettings(): Promise<void> {
  await NativePlugin.openNotificationAccessSettings();
}

export async function openNativeScreenAccessSettings(): Promise<void> {
  await NativePlugin.openScreenAccessSettings();
}

export async function updateNativeOverlayRisk(score: number): Promise<void> {
  if (!isNativeAndroid) return;
  await NativePlugin.updateOverlayRisk({ score });
}

export async function clearNativePendingContent(): Promise<void> {
  if (!isNativeAndroid) return;
  await NativePlugin.clearPendingContent();
}
