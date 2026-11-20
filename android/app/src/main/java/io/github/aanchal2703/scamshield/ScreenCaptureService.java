package io.github.aanchal2703.scamshield;

import android.accessibilityservice.AccessibilityService;
import android.content.Context;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.util.Log;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.WindowManager;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.widget.TextView;

import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

public class ScreenCaptureService extends AccessibilityService {
    private static volatile ScreenCaptureService instance;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Set<String> visibleText = new LinkedHashSet<>();
    private final Map<String, Set<String>> previouslySeenLines = new LinkedHashMap<>();
    private WindowManager windowManager;
    private TextView bubble;
    private String pendingPackageName = "";
    private Runnable pendingScreenRead;
    private int overlayColor = 0xFF1D4ED8;

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        instance = this;
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        showBubble();
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null || event.getPackageName() == null) return;
        String packageName = event.getPackageName().toString();
        if (packageName.equals(getPackageName())) return;
        int eventType = event.getEventType();
        if (eventType != AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
            && eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
            && eventType != AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED) {
            return;
        }

        pendingPackageName = packageName;
        if (pendingScreenRead != null) handler.removeCallbacks(pendingScreenRead);
        pendingScreenRead = () -> captureVisibleText(pendingPackageName);
        handler.postDelayed(pendingScreenRead, 450);
    }

    @Override
    public void onInterrupt() {}

    @Override
    public void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        if (bubble != null && windowManager != null) {
            windowManager.removeView(bubble);
            bubble = null;
        }
        instance = null;
        super.onDestroy();
    }

    static void updateRisk(int score) {
        ScreenCaptureService service = instance;
        if (service != null) service.setRiskColor(score);
    }

    static void clearCapturedContent() {
        ScreenCaptureService service = instance;
        if (service != null) {
            service.handler.post(() -> {
                service.visibleText.clear();
                service.previouslySeenLines.clear();
                service.setRiskColor(0);
            });
        }
    }

    private void captureVisibleText(String packageName) {
        if (packageName.isEmpty() || packageName.equals(getPackageName())) return;
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null) return;
        if (root.getPackageName() != null
            && !packageName.contentEquals(root.getPackageName())) {
            root.recycle();
            return;
        }

        visibleText.clear();
        collectText(root, 0, new int[] {0});
        root.recycle();
        if (visibleText.isEmpty()) return;

        Set<String> seen = previouslySeenLines.get(packageName);
        if (seen == null) {
            seen = new LinkedHashSet<>();
            previouslySeenLines.put(packageName, seen);
        }

        int capturedLines = 0;
        for (String line : visibleText) {
            if (!seen.add(line)) continue;
            boolean accepted = NativeContentRelay.capture(
                this,
                packageName,
                null,
                "screen",
                line
            );
            if (accepted) capturedLines++;
            if (capturedLines >= 40) break;
        }
        while (seen.size() > 250) {
            Iterator<String> iterator = seen.iterator();
            if (!iterator.hasNext()) break;
            iterator.next();
            iterator.remove();
        }
        while (previouslySeenLines.size() > 20) {
            Iterator<String> iterator = previouslySeenLines.keySet().iterator();
            if (!iterator.hasNext()) break;
            iterator.next();
            iterator.remove();
        }
        if (capturedLines > 0) setRiskColor(0);
    }

    private void collectText(AccessibilityNodeInfo node, int depth, int[] visited) {
        if (node == null || depth > 18 || visited[0]++ > 500 || !node.isVisibleToUser()) return;
        if (node.isPassword()) return;

        addText(node.getText());
        addText(node.getContentDescription());
        for (int index = 0; index < node.getChildCount(); index++) {
            AccessibilityNodeInfo child = node.getChild(index);
            if (child != null) {
                collectText(child, depth + 1, visited);
                child.recycle();
            }
        }
    }

    private void addText(CharSequence text) {
        if (text == null) return;
        String value = text.toString().trim();
        if (value.length() >= 2) visibleText.add(value);
    }

    private void showBubble() {
        if (windowManager == null || bubble != null) return;
        bubble = new TextView(this);
        bubble.setText("S");
        bubble.setTextColor(0xFFFFFFFF);
        bubble.setTextSize(17);
        bubble.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        bubble.setGravity(Gravity.CENTER);
        bubble.setContentDescription(
            "ScamShield. Tap to review recently detected text."
        );
        bubble.setElevation(dp(8));
        bubble.setBackground(background(overlayColor));
        bubble.setOnClickListener(view -> openScamShield());

        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
            dp(56),
            dp(56),
            WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        );
        params.gravity = Gravity.END | Gravity.CENTER_VERTICAL;
        params.x = dp(8);
        try {
            windowManager.addView(bubble, params);
        } catch (RuntimeException exception) {
            Log.e("ScamShield", "Could not create the accessibility overlay.", exception);
            bubble = null;
        }
    }

    private void openScamShield() {
        Intent launch = getPackageManager().getLaunchIntentForPackage(getPackageName());
        if (launch == null) return;
        launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(launch);
    }

    private void setRiskColor(int score) {
        overlayColor = score >= 80
            ? 0xFFDC2626
            : score >= 60
                ? 0xFFD97706
                : 0xFF15803D;
        handler.post(() -> {
            if (bubble != null) bubble.setBackground(background(overlayColor));
        });
    }

    private GradientDrawable background(int color) {
        GradientDrawable shape = new GradientDrawable();
        shape.setColor(color);
        shape.setShape(GradientDrawable.OVAL);
        shape.setStroke(dp(2), 0xFFFFFFFF);
        return shape;
    }

    private int dp(float value) {
        return (int) (value * getResources().getDisplayMetrics().density + 0.5f);
    }
}
