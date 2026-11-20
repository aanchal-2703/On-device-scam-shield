package io.github.aanchal2703.scamshield;

import android.content.ComponentName;
import android.content.Intent;
import android.provider.Settings;
import android.text.TextUtils;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

import java.util.List;

@CapacitorPlugin(name = "ScamShieldNative")
public class ScamShieldNativePlugin extends Plugin {
    @Override
    public void load() {
        NativeContentRelay.attach(this);
        processShareIntent(getActivity().getIntent());
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        processShareIntent(intent);
    }

    @PluginMethod
    public void getProtectionStatus(PluginCall call) {
        JSObject result = new JSObject();
        result.put("notificationAccess", isNotificationAccessEnabled());
        result.put("screenAccess", isScreenAccessEnabled());
        call.resolve(result);
    }

    @PluginMethod
    public void getPendingContent(PluginCall call) {
        JSArray events = new JSArray();
        List<JSObject> pending = NativeContentRelay.drainPending();
        for (JSObject event : pending) events.put(event);
        JSObject result = new JSObject();
        result.put("events", events);
        call.resolve(result);
    }

    @PluginMethod
    public void openNotificationAccessSettings(PluginCall call) {
        openSettings(call, new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS));
    }

    @PluginMethod
    public void openScreenAccessSettings(PluginCall call) {
        openSettings(call, new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS));
    }

    @PluginMethod
    public void updateOverlayRisk(PluginCall call) {
        int score = call.getInt("score", 0);
        ScreenCaptureService.updateRisk(score);
        call.resolve();
    }

    @PluginMethod
    public void clearPendingContent(PluginCall call) {
        NativeContentRelay.clearPending();
        ScreenCaptureService.clearCapturedContent();
        call.resolve();
    }

    void dispatchContent(JSObject event) {
        getActivity().runOnUiThread(() -> notifyListeners("contentDetected", event));
    }

    private void processShareIntent(Intent intent) {
        if (intent == null || !Intent.ACTION_SEND.equals(intent.getAction())) return;
        CharSequence sharedText = intent.getCharSequenceExtra(Intent.EXTRA_TEXT);
        if (sharedText == null) return;
        String sharedTitle = intent.getStringExtra(Intent.EXTRA_SUBJECT);
        NativeContentRelay.capture(
            getContext(),
            "",
            sharedTitle == null || sharedTitle.isEmpty() ? "Shared text" : sharedTitle,
            "share",
            sharedText.toString()
        );
    }

    private boolean isNotificationAccessEnabled() {
        String listeners = Settings.Secure.getString(
            getContext().getContentResolver(),
            "enabled_notification_listeners"
        );
        ComponentName service = new ComponentName(getContext(), NotificationCaptureService.class);
        return listeners != null && listeners.contains(service.flattenToString());
    }

    private boolean isScreenAccessEnabled() {
        String enabledServices = Settings.Secure.getString(
            getContext().getContentResolver(),
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        );
        if (TextUtils.isEmpty(enabledServices)) return false;
        ComponentName service = new ComponentName(getContext(), ScreenCaptureService.class);
        return enabledServices.contains(service.flattenToString());
    }

    private void openSettings(PluginCall call, Intent intent) {
        try {
            getActivity().startActivity(intent);
            call.resolve();
        } catch (Exception exception) {
            call.reject("Android settings could not be opened.", exception);
        }
    }
}
