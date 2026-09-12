package com.qevyno.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.IBinder;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

public class NotificationService extends Service {
    public static final String PREFS_NAME = "sliqchat_push";
    private static final String SERVER = "https://qevyno.sliqado.org";
    private static final String STATUS_CHANNEL = "sliqchat_background";
    private static final String MESSAGE_CHANNEL = "sliqchat_messages";
    private static final int STATUS_ID = 9101;
    private static final int MAX_SEEN = 160;
    private volatile boolean running = false;
    private Thread worker;

    @Override
    public void onCreate() {
        super.onCreate();
        createChannels();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        SharedPreferences p = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        if (!p.getBoolean("enabled", false) || p.getString("token", "").isEmpty()) {
            stopSelf();
            return START_NOT_STICKY;
        }
        try {
            startForeground(STATUS_ID, buildStatusNotification());
        } catch (Exception ignored) {}
        startWorker();
        return START_STICKY;
    }

    private synchronized void startWorker() {
        if (worker != null && worker.isAlive()) return;
        running = true;
        worker = new Thread(() -> {
            while (running) {
                try {
                    pollOnce();
                } catch (Exception ignored) {}
                try {
                    Thread.sleep(12000L);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }, "SkaysaNotifications");
        worker.start();
    }

    private void pollOnce() {
        SharedPreferences p = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        if (!p.getBoolean("enabled", false)) return;
        if (p.getBoolean("app_visible", false)) return;
        String token = p.getString("token", "");
        if (token == null || token.isEmpty()) return;

        HttpURLConnection c = null;
        try {
            URL url = new URL(SERVER + "/api/events");
            c = (HttpURLConnection) url.openConnection();
            c.setRequestMethod("GET");
            c.setConnectTimeout(6000);
            c.setReadTimeout(9000);
            c.setUseCaches(false);
            c.setRequestProperty("Accept", "application/json");
            c.setRequestProperty("Authorization", "Bearer " + token);

            int code = c.getResponseCode();
            if (code == 401) {
                p.edit().putBoolean("enabled", false).remove("token").apply();
                stopSelf();
                return;
            }
            if (code != 200) return;

            String raw = readAll(c.getInputStream());
            JSONObject root = new JSONObject(raw);
            if (!root.optBoolean("ok", false)) return;
            JSONArray events = root.optJSONArray("events");
            if (events == null) return;

            Set<String> seen = loadSeenSet(p);
            ArrayDeque<String> order = loadSeenOrder(p);
            boolean changed = false;

            for (int i = 0; i < events.length(); i++) {
                JSONObject e = events.optJSONObject(i);
                if (e == null || !"message".equals(e.optString("type"))) continue;
                String id = e.optString("id", "");
                if (id.isEmpty() || seen.contains(id)) continue;
                if (postMessageNotification(e, id)) {
                    seen.add(id);
                    order.addLast(id);
                    while (order.size() > MAX_SEEN) {
                        String old = order.removeFirst();
                        seen.remove(old);
                    }
                    changed = true;
                }
            }

            if (changed) saveSeenOrder(p, order);
        } catch (Exception ignored) {
        } finally {
            if (c != null) c.disconnect();
        }
    }

    private boolean postMessageNotification(JSONObject e, String id) {
        try {
            String title = e.optString("display_name", "").trim();
            if (title.isEmpty()) title = e.optString("sender_phone", "").trim();
            if (title.isEmpty()) title = "Skaysa";

            String body = cleanPreview(e.optString("text", ""));
            Intent open = new Intent(this, MainActivity.class);
            open.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            PendingIntent pi = PendingIntent.getActivity(
                this,
                Math.abs(id.hashCode()),
                open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            Notification.Builder b = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? new Notification.Builder(this, MESSAGE_CHANNEL)
                : new Notification.Builder(this);

            b.setSmallIcon(R.drawable.ic_notification)
             .setContentTitle(title)
             .setContentText(body)
             .setStyle(new Notification.BigTextStyle().bigText(body))
             .setContentIntent(pi)
             .setAutoCancel(true)
             .setCategory(Notification.CATEGORY_MESSAGE)
             .setWhen(System.currentTimeMillis())
             .setShowWhen(true);

            NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            if (nm == null) return false;
            nm.notify(12000 + Math.abs(id.hashCode() % 100000), b.build());
            return true;
        } catch (SecurityException denied) {
            return false;
        } catch (Exception ignored) {
            return false;
        }
    }

    private String cleanPreview(String text) {
        text = text == null ? "" : text.trim();
        boolean de = Locale.getDefault().getLanguage().toLowerCase(Locale.ROOT).startsWith("de");
        if (text.startsWith("[[SLIQCHAT_GROUP_V1:")) return de ? "Neue Gruppennachricht" : "New group message";
        if (text.startsWith("[[SLIQCHAT_MEDIA_V1:")) return de ? "Bild, GIF oder Video" : "Photo, GIF or video";
        if (text.isEmpty()) return de ? "Neue Nachricht" : "New message";
        text = text.replaceAll("\\s+", " ").trim();
        return text.length() > 180 ? text.substring(0, 177) + "…" : text;
    }

    private void createChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (nm == null) return;

        NotificationChannel status = new NotificationChannel(
            STATUS_CHANNEL,
            "Skaysa Hintergrunddienst",
            NotificationManager.IMPORTANCE_MIN
        );
        status.setDescription("Hält Skaysa-Benachrichtigungen aktiv.");
        status.setShowBadge(false);
        nm.createNotificationChannel(status);

        NotificationChannel messages = new NotificationChannel(
            MESSAGE_CHANNEL,
            "Skaysa Nachrichten",
            NotificationManager.IMPORTANCE_HIGH
        );
        messages.setDescription("Benachrichtigungen für neue Skaysa-Nachrichten.");
        messages.enableVibration(true);
        nm.createNotificationChannel(messages);
    }

    private Notification buildStatusNotification() {
        Intent open = new Intent(this, MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(
            this, 9102, open,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        Notification.Builder b = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
            ? new Notification.Builder(this, STATUS_CHANNEL)
            : new Notification.Builder(this);
        return b.setSmallIcon(R.drawable.ic_notification)
            .setContentTitle("Skaysa")
            .setContentText("Benachrichtigungen aktiv")
            .setContentIntent(pi)
            .setOngoing(true)
            .setCategory(Notification.CATEGORY_SERVICE)
            .setShowWhen(false)
            .build();
    }

    private String readAll(InputStream in) throws Exception {
        try (InputStream input = in; ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buf = new byte[8192];
            int n;
            while ((n = input.read(buf)) > 0) out.write(buf, 0, n);
            return out.toString(StandardCharsets.UTF_8.name());
        }
    }

    private ArrayDeque<String> loadSeenOrder(SharedPreferences p) {
        ArrayDeque<String> out = new ArrayDeque<>();
        String raw = p.getString("seen_ids", "");
        if (raw == null || raw.isEmpty()) return out;
        String[] parts = raw.split("\\n");
        for (String x : parts) if (!x.isEmpty()) out.addLast(x);
        while (out.size() > MAX_SEEN) out.removeFirst();
        return out;
    }

    private Set<String> loadSeenSet(SharedPreferences p) {
        return new HashSet<>(loadSeenOrder(p));
    }

    private void saveSeenOrder(SharedPreferences p, ArrayDeque<String> order) {
        StringBuilder s = new StringBuilder();
        for (String id : order) {
            if (s.length() > 0) s.append('\n');
            s.append(id);
        }
        p.edit().putString("seen_ids", s.toString()).apply();
    }

    @Override
    public void onDestroy() {
        running = false;
        if (worker != null) worker.interrupt();
        worker = null;
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
