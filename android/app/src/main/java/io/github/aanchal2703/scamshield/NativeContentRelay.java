package io.github.aanchal2703.scamshield;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.os.SystemClock;

import com.getcapacitor.JSObject;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.UUID;

final class NativeContentRelay {
    private static final int MAX_PENDING_EVENTS = 30;
    private static final long DUPLICATE_WINDOW_MS = 15_000;
    private static final ArrayDeque<JSObject> PENDING = new ArrayDeque<>();
    private static final Map<String, Long> RECENT_FINGERPRINTS = new HashMap<>();
    private static ScamShieldNativePlugin plugin;

    private NativeContentRelay() {}

    static synchronized void attach(ScamShieldNativePlugin nativePlugin) {
        plugin = nativePlugin;
    }

    static synchronized boolean capture(
        Context context,
        String packageName,
        String appLabel,
        String source,
        String text
    ) {
        if (text == null) return false;
        String content = text.trim();
        if (content.length() < 3) return false;
        if (content.length() > 6000) content = content.substring(0, 6000);

        String safePackage = packageName == null ? "" : packageName;
        if (safePackage.equals(context.getPackageName())) return false;

        long now = SystemClock.elapsedRealtime();
        RECENT_FINGERPRINTS.entrySet().removeIf(
            entry -> now - entry.getValue() > DUPLICATE_WINDOW_MS
        );
        String fingerprint = fingerprint(safePackage + "\n" + content);
        Long previous = RECENT_FINGERPRINTS.put(fingerprint, now);
        if (previous != null && now - previous < DUPLICATE_WINDOW_MS) return false;
        if (RECENT_FINGERPRINTS.size() > 500) {
            RECENT_FINGERPRINTS.entrySet().removeIf(
                entry -> now - entry.getValue() > DUPLICATE_WINDOW_MS / 2
            );
        }

        JSObject event = new JSObject();
        event.put("eventId", UUID.randomUUID().toString());
        event.put("packageName", safePackage);
        event.put("appLabel", appLabel == null || appLabel.isEmpty()
            ? resolveAppLabel(context, safePackage)
            : appLabel);
        event.put("source", source);
        event.put("text", content);
        event.put("capturedAt", System.currentTimeMillis());

        while (PENDING.size() >= MAX_PENDING_EVENTS) PENDING.removeFirst();
        PENDING.addLast(event);
        ScamShieldNativePlugin listener = plugin;
        if (listener != null) listener.dispatchContent(event);
        return true;
    }

    static synchronized List<JSObject> drainPending() {
        List<JSObject> events = new ArrayList<>(PENDING);
        PENDING.clear();
        return events;
    }

    static synchronized void clearPending() {
        PENDING.clear();
        RECENT_FINGERPRINTS.clear();
    }

    private static String resolveAppLabel(Context context, String packageName) {
        if (packageName.isEmpty()) return "Shared text";
        try {
            ApplicationInfo info = context.getPackageManager().getApplicationInfo(packageName, 0);
            return context.getPackageManager().getApplicationLabel(info).toString();
        } catch (android.content.pm.PackageManager.NameNotFoundException exception) {
            return packageName;
        }
    }

    private static String fingerprint(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                .digest(value.toLowerCase(Locale.ROOT).getBytes(StandardCharsets.UTF_8));
            StringBuilder output = new StringBuilder(digest.length * 2);
            for (byte item : digest) output.append(String.format("%02x", item));
            return output.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable on this Android device.", exception);
        }
    }
}
