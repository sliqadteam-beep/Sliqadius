package com.qevyno.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicBoolean;

public final class UpdateChecker {
    private static final String UPDATE_URL = "https://sliqado.org/qevyno/update.json";
    private static final AtomicBoolean RUNNING = new AtomicBoolean(false);

    private UpdateChecker() {}

    public static void check(Activity activity) {
        if (activity == null || activity.isFinishing()) return;
        if (!RUNNING.compareAndSet(false, true)) return;

        new Thread(() -> {
            HttpURLConnection connection = null;
            try {
                URL url = new URL(UPDATE_URL + "?t=" + System.currentTimeMillis());
                connection = (HttpURLConnection) url.openConnection();
                connection.setConnectTimeout(3000);
                connection.setReadTimeout(3000);
                connection.setUseCaches(false);
                connection.setRequestProperty("Accept", "application/json");
                connection.setRequestProperty("Cache-Control", "no-cache");

                int status = connection.getResponseCode();
                if (status < 200 || status >= 300) return;

                byte[] data;
                try (InputStream in = connection.getInputStream();
                     ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                    byte[] buffer = new byte[4096];
                    int read;
                    while ((read = in.read(buffer)) > 0) out.write(buffer, 0, read);
                    data = out.toByteArray();
                }

                JSONObject metadata = new JSONObject(new String(data, StandardCharsets.UTF_8));
                long remoteCode = metadata.optLong("versionCode", 0);
                String remoteName = metadata.optString("versionName", "").trim();
                String apkUrl = metadata.optString("apkUrl", "").trim();
                String notes = metadata.optString("notes", "").trim();

                android.content.pm.PackageInfo packageInfo =
                    activity.getPackageManager().getPackageInfo(activity.getPackageName(), 0);
                long currentCode = Build.VERSION.SDK_INT >= 28
                    ? packageInfo.getLongVersionCode()
                    : packageInfo.versionCode;

                if (remoteCode <= currentCode) return;
                if (!apkUrl.startsWith("https://sliqado.org/")) return;

                String versionLine = remoteName.isEmpty()
                    ? "A new Qevyno update is available."
                    : "Qevyno " + remoteName + " is available.";
                String message = notes.isEmpty() ? versionLine : versionLine + "\n\n" + notes;

                activity.runOnUiThread(() -> {
                    if (activity.isFinishing() || activity.isDestroyed()) return;
                    new android.app.AlertDialog.Builder(activity)
                        .setTitle("Update available")
                        .setMessage(message)
                        .setNegativeButton("Later", null)
                        .setPositiveButton("Download Update", (dialog, which) -> {
                            try {
                                Intent browser = new Intent(Intent.ACTION_VIEW, Uri.parse(apkUrl));
                                activity.startActivity(browser);
                            } catch (Exception ignored) {}
                        })
                        .show();
                });
            } catch (Exception ignored) {
                // Update checks must never prevent Qevyno from starting.
            } finally {
                if (connection != null) connection.disconnect();
                RUNNING.set(false);
            }
        }, "Qevyno-Update-Check").start();
    }
}
