package io.github.aanchal2703.scamshield;

import android.app.Notification;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;

public class NotificationCaptureService extends NotificationListenerService {
    @Override
    public void onNotificationPosted(StatusBarNotification statusBarNotification) {
        if (statusBarNotification == null || statusBarNotification.isOngoing()) return;
        String packageName = statusBarNotification.getPackageName();
        if (packageName == null || packageName.equals(getPackageName())) return;

        Notification notification = statusBarNotification.getNotification();
        if (notification == null || notification.extras == null) return;

        CharSequence title = notification.extras.getCharSequence(Notification.EXTRA_TITLE);
        CharSequence text = notification.extras.getCharSequence(Notification.EXTRA_BIG_TEXT);
        if (text == null) text = notification.extras.getCharSequence(Notification.EXTRA_TEXT);

        StringBuilder content = new StringBuilder();
        append(content, title);
        append(content, text);
        CharSequence[] lines = notification.extras.getCharSequenceArray(Notification.EXTRA_TEXT_LINES);
        if (lines != null) {
            for (CharSequence line : lines) append(content, line);
        }

        if (content.length() == 0) return;
        NativeContentRelay.capture(
            this,
            packageName,
            null,
            "notification",
            content.toString()
        );
    }

    private void append(StringBuilder output, CharSequence value) {
        if (value == null) return;
        String text = value.toString().trim();
        if (text.isEmpty()) return;
        if (output.length() > 0) output.append('\n');
        output.append(text);
    }
}
